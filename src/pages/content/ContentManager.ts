import browser from 'webextension-polyfill';
import { rateManager } from '../../api';
import { myFinService } from '../../api/myfin';
import { processPrices } from './converter';
import { logger } from '../../api/utils/logger';
import { Currency } from '../../api/types';
import { remoteConfigManager } from './core/RemoteConfig';
import { injectStyles } from './styles';

export class ContentManager {
  private timeoutId: number | null = null;
  private observer: MutationObserver | null = null;

  async init() {
    injectStyles();
    await remoteConfigManager.initialize();
    await this.runConversion();
    this.setupObserver();
    this.setupStorageListener();
  }

  private async getCurrency(): Promise<Currency> {
    const res = await browser.storage.local.get('targetCurrency');
    return (res.targetCurrency as Currency) || 'USD';
  }

  private runConversion = async () => {
    const storage = await browser.storage.local.get(['isEnabled', 'selectedBank']);
    const isEnabled = storage.isEnabled !== false;
    const selectedBank = (storage.selectedBank as string) || 'nbrb';
    
    if (!isEnabled) {
      this.cleanup();
      return;
    }

    const configs = remoteConfigManager.getConfigs();
    const hasUnprocessed = configs.some(config => 
      document.querySelector(`${config.selector}:not(.usd-processed)`)
    );

    if (!hasUnprocessed) return;

    try {
      const currency = await this.getCurrency();
      let rate: number | null = null;

      // Use MyFin for specific bank if selected
      if (selectedBank !== 'nbrb') {
        rate = await myFinService.getRateForBank(currency, selectedBank);
        if (rate) {
          logger.log(`Using MyFin rate for ${currency} bank: ${selectedBank} -> ${rate}`);
        }
      }

      // Fallback to NBRB or if MyFin failed
      if (!rate) {
        rate = await rateManager.fetchBestRate(currency);
      }

      processPrices(rate, currency);
    } catch (e) {
      logger.error('Failed to run conversion', e);
    }
  };

  private cleanup() {
    // Remove processed flag
    document.querySelectorAll('.usd-processed').forEach(el => {
      el.classList.remove('usd-processed');
    });
    // Remove injected elements
    document.querySelectorAll('.av-converted-price').forEach(el => {
      el.remove();
    });
  }

  private setupObserver() {
    this.observer = new MutationObserver(() => {
      if (this.timeoutId) window.clearTimeout(this.timeoutId);
      this.timeoutId = window.setTimeout(this.runConversion, 200);
    });

    this.observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  private setupStorageListener() {
    browser.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && (changes.targetCurrency || changes.isEnabled || changes.selectedBank)) {
        if (changes.isEnabled && !changes.isEnabled.newValue) {
          this.cleanup();
        } else {
          document.querySelectorAll('.usd-processed').forEach(el => {
            el.classList.remove('usd-processed');
          });
          this.runConversion();
        }
      }
    });
  }
}
