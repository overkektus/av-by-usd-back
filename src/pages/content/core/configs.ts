import { PriceTargetConfig } from './types';

export const TARGET_CONFIGS: PriceTargetConfig[] = [
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
  { selector: '.salon-listing-model__banner-priсe', customStyle: { color: "white", paddingLeft: "15px" } },

  // Salon items in search
  { selector: '.salon-listing-items__item-price-byn' },

  // Salon car card primary price
  { selector: '.salon-card__price-primary' },

  // Salon listing tile price
  { 
    selector: '.salon-listing-tile__item-price',
    insertPosition: 'beforeend' 
  }
];
