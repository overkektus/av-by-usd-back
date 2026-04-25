import { CourseFetcher } from './CourseFetcher';

export class DomFetcher extends CourseFetcher {
  get sourceName(): string { 
    return 'av.by Page DOM'; 
  }

  async fetchRate(): Promise<number> {
    // 1. Try desktop version (.main-converter)
    const converterEl = document.querySelector('.main-converter');
    if (converterEl) {
      const text = converterEl.textContent || '';
      const match = text.match(/1\s*USD\s*=\s*([\d.,]+)\s*BYN/i);
      if (match && match[1]) {
        const rate = parseFloat(match[1].replace(',', '.'));
        if (!isNaN(rate) && rate > 0) return rate;
      }
    }

    // 2. Try mobile version nav link (usually only on main page)
    const mobileLink = document.querySelector('a[href*="/currency"].main-nav__link, .main-nav__item--separate a');
    if (mobileLink) {
      const text = mobileLink.textContent || '';
      // Matches "USD 2.82" or similar
      const match = text.match(/USD\s*([\d.,]+)/i);
      if (match && match[1]) {
        const rate = parseFloat(match[1].replace(',', '.'));
        if (!isNaN(rate) && rate > 0) return rate;
      }
    }

    throw new Error('Exchange rate element not found on this page (intended fallback to API)');
  }
}
