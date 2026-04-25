import { CourseFetcher } from './CourseFetcher';
import { AllRates, Currency } from '../types';

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

  async fetchAllRates(): Promise<Partial<AllRates>> {
    const result: Partial<AllRates> = {};
    
    // Check if we are on /currency page with the full form
    const bynInput = document.querySelector('input[name="byn"]') as HTMLInputElement;
    const usdInput = document.querySelector('input[name="usd"]') as HTMLInputElement;
    
    if (bynInput && usdInput) {
      const bynVal = parseFloat(bynInput.value.replace(',', '.'));
      const usdVal = parseFloat(usdInput.value.replace(',', '.'));
      
      if (!isNaN(bynVal) && !isNaN(usdVal) && usdVal === 1) {
        result.USD = bynVal;
        
        // Try to get others
        const eurInput = document.querySelector('input[name="eur"]') as HTMLInputElement;
        const rubInput = document.querySelector('input[name="rub"]') as HTMLInputElement;
        
        if (eurInput) {
          const val = parseFloat(eurInput.value.replace(',', '.'));
          if (!isNaN(val) && val > 0) result.EUR = bynVal / val;
        }
        
        if (rubInput) {
          const val = parseFloat(rubInput.value.replace(',', '.'));
          if (!isNaN(val) && val > 0) result.RUB = bynVal / val;
        }
        
        return result;
      }
    }
    
    // Fallback: just try USD from the page
    try {
      result.USD = await this.fetchRate('USD');
    } catch (e) {}
    
    return result;
  }
}
