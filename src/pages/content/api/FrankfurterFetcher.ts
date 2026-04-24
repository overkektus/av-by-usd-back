import { CourseFetcher } from './CourseFetcher';
import type { FrankfurterV2Response } from './types';

export class FrankfurterFetcher extends CourseFetcher {
  get sourceName(): string { 
    return 'Frankfurter'; 
  }

  async fetchRate(): Promise<number> {
    const res = await fetch('https://api.frankfurter.dev/v2/rates?base=USD');
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = (await res.json()) as FrankfurterV2Response;
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid Frankfurter v2 data format');
    }

    const bynRate = data.find(item => item.quote === 'BYN');
    if (bynRate && typeof bynRate.rate === 'number') {
      return bynRate.rate;
    }
    
    throw new Error('BYN not found in Frankfurter v2 response');
  }
}
