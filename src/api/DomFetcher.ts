import { CourseFetcher } from './CourseFetcher';

export class DomFetcher extends CourseFetcher {
  get sourceName(): string { 
    return 'av.by Page DOM'; 
  }

  async fetchRate(): Promise<number> {
    // Try to find the converter block on the current page
    // This block exists on car detail pages (e.g. cars.av.by/audi/...)
    const converterEl = document.querySelector('.main-converter');
    if (!converterEl) {
      throw new Error('Converter element not found on current page');
    }

    const text = converterEl.textContent || '';

    // Match pattern: "1 USD = 2.8 BYN" or "1 USD = 2,8 BYN"
    const match = text.match(/1\s*USD\s*=\s*([\d.,]+)\s*BYN/i);

    if (match && match[1]) {
      // Replace comma with dot for parseFloat
      const rate = parseFloat(match[1].replace(',', '.'));
      if (!isNaN(rate) && rate > 0) {
        return rate;
      }
    }

    throw new Error('Could not parse exchange rate from converter element');
  }
}
