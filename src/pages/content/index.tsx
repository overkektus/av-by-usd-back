import browser from 'webextension-polyfill';
import { rateManager } from '../../api';
import { processPrices } from './converter';
import { logger } from '../../api/utils/logger';
import { Currency } from '../../api/types';

async function init() {
  const getCurrency = async (): Promise<Currency> => {
    const res = await browser.storage.local.get('targetCurrency');
    return (res.targetCurrency as Currency) || 'USD';
  };

  const runConversion = async () => {
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

  // Watch for DOM changes (throttled)
  let timeoutId: number | null = null;
  const observer = new MutationObserver(() => {
    if (timeoutId) window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(runConversion, 200);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Listen for settings changes
  browser.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.targetCurrency) {
      runConversion();
    }
  });
}

init();
