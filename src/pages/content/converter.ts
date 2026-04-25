import { TARGET_CONFIGS } from "./core/configs";
import { Currency } from "../../api/types";

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  'USD': '$',
  'EUR': '€',
  'RUB': '₽'
};

export function processPrices(rate: number, currency: Currency) {
  const symbol = CURRENCY_SYMBOLS[currency];
  
  for (const config of TARGET_CONFIGS) {
    const elements = document.querySelectorAll(`${config.selector}:not(.usd-processed)`);
    
    elements.forEach((el) => {
      el.classList.add('usd-processed');
      
      const text = el.textContent || '';
      const cleanText = text.replace(/[^\d]/g, '');
      const amountByn = parseInt(cleanText, 10);
      
      if (!isNaN(amountByn) && amountByn > 0) {
        const convertedAmount = amountByn / rate;
        
        // Logical rounding:
        // - Under 100: show 2 decimal places (cents matter for parts/accessories)
        // - 100 and above: round to whole number
        const showDecimals = convertedAmount < 100;
        
        const formattedValue = new Intl.NumberFormat('ru-RU', {
          minimumFractionDigits: showDecimals ? 2 : 0,
          maximumFractionDigits: showDecimals ? 2 : 0,
        }).format(convertedAmount) + ' ' + symbol;
        
        // Remove existing conversion if rate or currency changed
        const existing = el.parentElement?.querySelector('.av-converted-price');
        if (existing) {
          existing.remove();
        }

        const convertedDiv = document.createElement('div');
        convertedDiv.className = 'av-converted-price';
        convertedDiv.style.fontSize = '14px';
        convertedDiv.style.color = config.color || '#707f8d';
        convertedDiv.style.marginTop = '4px';
        convertedDiv.style.fontWeight = 'bold';
        
        if (config.backgroundColor) {
          convertedDiv.style.backgroundColor = config.backgroundColor;
          convertedDiv.style.padding = '2px 6px';
          convertedDiv.style.borderRadius = '4px';
          convertedDiv.style.display = 'inline-block';
        }

        if (config.customStyle) {
          Object.assign(convertedDiv.style, config.customStyle);
        }
        
        convertedDiv.textContent = `≈ ${formattedValue}`;
        
        const position = config.insertPosition || 'afterend';
        el.insertAdjacentElement(position, convertedDiv);
      }
    });
  }
}

