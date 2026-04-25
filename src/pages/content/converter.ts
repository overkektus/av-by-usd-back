import { TARGET_CONFIGS } from './core/configs';

export function processPrices(usdRate: number) {
  for (const config of TARGET_CONFIGS) {
    const elements = document.querySelectorAll(`${config.selector}:not(.usd-processed)`);
    
    elements.forEach((el) => {
      el.classList.add('usd-processed');
      
      const text = el.textContent || '';
      const cleanText = text.replace(/[^\d]/g, '');
      const amountByn = parseInt(cleanText, 10);
      
      if (!isNaN(amountByn) && amountByn > 0) {
        const convertedAmount = amountByn / usdRate;
        
        // Logical rounding:
        // - Under 100: show 2 decimal places (cents matter for parts/accessories)
        // - 100 and above: round to whole number
        const showDecimals = convertedAmount < 100;
        
        const formattedUsd = new Intl.NumberFormat('ru-RU', {
          minimumFractionDigits: showDecimals ? 2 : 0,
          maximumFractionDigits: showDecimals ? 2 : 0,
        }).format(convertedAmount) + ' $';
        
        const usdDiv = document.createElement('div');
        usdDiv.className = 'av-usd-converted-price';
        usdDiv.style.fontSize = '14px';
        usdDiv.style.color = config.color || '#707f8d'; // Custom color or default grey
        usdDiv.style.marginTop = '4px';
        usdDiv.style.fontWeight = 'bold';
        
        if (config.backgroundColor) {
          usdDiv.style.backgroundColor = config.backgroundColor;
          usdDiv.style.padding = '2px 6px';
          usdDiv.style.borderRadius = '4px';
          usdDiv.style.display = 'inline-block';
        }

        if (config.customStyle) {
          Object.assign(usdDiv.style, config.customStyle);
        }
        
        usdDiv.textContent = `≈ ${formattedUsd}`;
        
        const position = config.insertPosition || 'afterend';
        el.insertAdjacentElement(position, usdDiv);
      }
    });
  }
}

