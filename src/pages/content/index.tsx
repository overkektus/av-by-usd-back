import { rateManager } from './api';
import { processPrices } from './converter';

// Initialize
async function init() {
  try {
    const rate = await rateManager.fetchBestRate();
    processPrices(rate);
    
    let timeoutId: number | null = null;
    const observer = new MutationObserver(() => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(() => {
        processPrices(rate);
      }, 200);
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  } catch (e) {
    console.error('[AV.BY USD] Extension disabled: could not obtain exchange rate.', e);
  }
}

init();
