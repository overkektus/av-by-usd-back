import browser from 'webextension-polyfill';
import { rateManager } from '../../api';
import { processPrices } from './converter';
import { logger } from '../../api/utils/logger';
import { Currency } from '../../api/types';
import { TARGET_CONFIGS } from './core/configs';

async function init() {
  const getCurrency = async (): Promise<Currency> => {
    const res = await browser.storage.local.get('targetCurrency');
    return (res.targetCurrency as Currency) || 'USD';
  };

  const runConversion = async () => {
    const hasUnprocessed = TARGET_CONFIGS.some(config => 
      document.querySelector(`${config.selector}:not(.usd-processed)`)
    );

    if (!hasUnprocessed) return;

    try {
      const currency = await getCurrency();
      const rate = await rateManager.fetchBestRate(currency);
      processPrices(rate, currency);
    } catch (e) {
      logger.error('Failed to run conversion', e);
    }
  };

  // Initial run
  await runConversion();

  let timeoutId: number | null = null;
  const observer = new MutationObserver(() => {
    if (timeoutId) window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(runConversion, 200);
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  browser.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.targetCurrency) {
      runConversion();
    }
  });
}

init();
