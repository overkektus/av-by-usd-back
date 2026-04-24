type InsertPositionType = 'afterend' | 'beforeend' | 'afterbegin' | 'beforebegin';

interface PriceTargetConfig {
  selector: string;
  insertPosition?: InsertPositionType;
  color?: string;
  backgroundColor?: string;
  customStyle?: Partial<CSSStyleDeclaration>;
}

const TARGET_CONFIGS: PriceTargetConfig[] = [
  // On car page. Example:https://cars.av.by/audi/q4-e-tron/128024197
  { selector: '.card__price-button' },

  // On car page same prices section and parts section.
  { selector: '.listing-top__price-primary' },

  // On main page. Interesting today section. 
  { selector: '.listing-index__price' },

  // On main page. New auto section.
  { 
    selector: '.salon-listing-top__prices', 
    customStyle: { color: "#fff" }
  },

  // On filter page. https://cars.av.by/filter
  { selector: '.listing-item__price-primary' },

  // --- NEW SALON SELECTORS ---
  
  // Salon main banner (Adfox)
  { selector: '.price' },

  // Salon model banner
  { selector: '.salon-listing-model__banner-priсe' },

  // Salon items in search
  { selector: '.salon-listing-items__item-price-byn' },

  // Salon car card primary price
  { selector: '.salon-card__price-primary' }
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

