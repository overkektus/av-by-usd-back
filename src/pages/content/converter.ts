type InsertPositionType = 'afterend' | 'beforeend' | 'afterbegin' | 'beforebegin';

interface PriceTargetConfig {
  selector: string;
  insertPosition?: InsertPositionType;
  customStyle?: Partial<CSSStyleDeclaration>;
}

const TARGET_CONFIGS: PriceTargetConfig[] = [
  { selector: '.card__price-button' },
  { selector: '.listing-top__price-primary' },
  { selector: '.listing-index__price' },
  { selector: '.salon-listing-top__prices' },
  { selector: '.listing-item__price-primary' }
];

export function processPrices(usdRate: number) {
  for (const config of TARGET_CONFIGS) {
    const elements = document.querySelectorAll(`${config.selector}:not(.usd-processed)`);
    
    elements.forEach((el) => {
      el.classList.add('usd-processed');
      
      const text = el.textContent || '';
      const cleanText = text.replace(/[^\d]/g, '');
      const amountByn = parseInt(cleanText, 10);
      
      if (!isNaN(amountByn) && amountByn > 0) {
        const amountUsd = Math.round(amountByn / usdRate);
        
        const formattedUsd = new Intl.NumberFormat('ru-RU').format(amountUsd) + ' $';
        
        const usdDiv = document.createElement('div');
        usdDiv.className = 'av-usd-converted-price';
        usdDiv.style.fontSize = '14px';
        usdDiv.style.color = '#707f8d';
        usdDiv.style.marginTop = '4px';
        usdDiv.style.fontWeight = 'bold';
        
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
