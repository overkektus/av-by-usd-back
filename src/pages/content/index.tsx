import { rateManager } from './api';
import { processPrices } from './converter';

// Initialize
async function init() {
  const rate = await rateManager.fetchBestRate();
  processPrices(rate);
  
  // Use MutationObserver for dynamically loaded elements
  const observer = new MutationObserver(() => {
    processPrices(rate);
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

init();
