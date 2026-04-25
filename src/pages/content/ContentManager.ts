import browser from 'webextension-polyfill';
import { rateManager } from '../../api';
import { processPrices } from './converter';
import { logger } from '../../api/utils/logger';
import { Currency } from '../../api/types';
import { TARGET_CONFIGS } from './core/configs';
import { injectStyles } from './styles';

export class ContentManager {
  private timeoutId: number | null = null;
  private observer: MutationObserver | null = null;

  async init() {
    injectStyles();
    await this.runConversion();
    this.setupObserver();
    this.setupStorageListener();
  }

  private async getCurrency(): Promise<Currency> {
    const res = await browser.storage.local.get('targetCurrency');
    return (res.targetCurrency as Currency) || 'USD';
  }

  private runConversion = async () => {
    const { isEnabled = true } = await browser.storage.local.get('isEnabled');
    
    if (!isEnabled) {
      this.cleanup();
      return;
    }

    const hasUnprocessed = TARGET_CONFIGS.some(config => 
      document.querySelector(`${config.selector}:not(.usd-processed)`)
    );

    if (!hasUnprocessed) return;

    try {
      const currency = await this.getCurrency();
      const rate = await rateManager.fetchBestRate(currency);
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
      if (area === 'local' && (changes.targetCurrency || changes.isEnabled)) {
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
