import { CourseFetcher } from './CourseFetcher';

export class DomFetcher extends CourseFetcher {
  get sourceName(): string { 
    return 'AV.BY Page DOM'; 
  }

  async fetchRate(): Promise<number> {
    // Look for the converter element on the page: 1 USD = 2.8 BYN
    const element = document.querySelector('.main-converter div');
    const text = element?.textContent || '';
    
    // Match the number after "1 USD ="
    const match = text.match(/1\s*USD\s*=\s*([\d.]+)/i);
    
    if (match && match[1]) {
      const rate = parseFloat(match[1]);
      if (!isNaN(rate) && rate > 0) {
        return rate;
      }
    }
    
    throw new Error('Could not find exchange rate in page DOM');
  }
}
