import { CourseFetcher } from './CourseFetcher';
import { Currency } from '../types';

export class DomFetcher extends CourseFetcher {
  get sourceName(): string { 
    return 'av.by Page DOM'; 
  }

  async fetchRate(currency: Currency): Promise<number> {
    // 1. Try desktop version (.main-converter)
    // Desktop converter usually only shows USD
    const converterEl = document.querySelector('.main-converter');
    if (converterEl) {
      const text = converterEl.textContent || '';
      // Pattern: "1 USD = 2.8 BYN" or "1 EUR = 3.1 BYN"
      const regex = new RegExp(`1\\s*${currency}\\s*=\\s*([\\d.,]+)\\s*BYN`, 'i');
      const match = text.match(regex);
      if (match && match[1]) {
        const rate = parseFloat(match[1].replace(',', '.'));
        if (!isNaN(rate) && rate > 0) return rate;
      }
    }

    // 2. Try mobile version nav link
    const mobileLink = document.querySelector('a[href*="/currency"].main-nav__link, .main-nav__item--separate a');
    if (mobileLink) {
      const text = mobileLink.textContent || '';
      // Pattern: "USD 2.82" or "EUR 3.10"
      const regex = new RegExp(`${currency}\\s*([\\d.,]+)`, 'i');
      const match = text.match(regex);
      if (match && match[1]) {
        const rate = parseFloat(match[1].replace(',', '.'));
        if (!isNaN(rate) && rate > 0) return rate;
      }
    }

    // 3. Try /currency page form (if user happens to be there)
    const bynInput = document.querySelector('input[name="byn"]') as HTMLInputElement;
    const targetInput = document.querySelector(`input[name="${currency.toLowerCase()}"]`) as HTMLInputElement;
    
    if (bynInput && targetInput) {
      const bynVal = parseFloat(bynInput.value.replace(',', '.'));
      const targetVal = parseFloat(targetInput.value.replace(',', '.'));
      
      if (!isNaN(bynVal) && !isNaN(targetVal) && targetVal > 0) {
        // If USD is 1, then BYN value is the rate for 1 USD.
        // If we want EUR, and USD=1, BYN=2.81, EUR=0.85, then 1 EUR = 2.81 / 0.85 BYN.
        const usdInput = document.querySelector('input[name="usd"]') as HTMLInputElement;
        const usdVal = usdInput ? parseFloat(usdInput.value.replace(',', '.')) : 1;
        
        if (usdVal === 1) {
          const rate = bynVal / targetVal;
          if (!isNaN(rate) && rate > 0) return rate;
        }
      }
    }

    throw new Error(`Currency ${currency} not found in page DOM`);
  }
}
