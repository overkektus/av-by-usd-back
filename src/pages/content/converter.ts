import { remoteConfigManager } from "./core/RemoteConfig";
import { Currency } from "../../api/types";
import { parseBynPrice, formatConvertedPrice } from "./utils";
import { createPriceElement, removeExistingConversion } from "./ui";

export function processPrices(rate: number, currency: Currency) {
  const configs = remoteConfigManager.getConfigs();
  for (const config of configs) {
    const elements = document.querySelectorAll(`${config.selector}:not(.usd-processed)`);
    
    elements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.classList.add('usd-processed');
      
      const amountByn = parseBynPrice(htmlEl.textContent || '');
      
      if (amountByn > 0) {
        const convertedAmount = amountByn / rate;
        const formattedValue = formatConvertedPrice(convertedAmount, currency);
        
        removeExistingConversion(htmlEl);
        
        const priceEl = createPriceElement(formattedValue, config);
        const position = config.insertPosition || 'afterend';
        htmlEl.insertAdjacentElement(position, priceEl);
      }
    });
  }
}
