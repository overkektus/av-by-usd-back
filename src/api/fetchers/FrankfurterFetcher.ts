import { CourseFetcher } from './CourseFetcher';
import { Currency, FrankfurterV2Response } from '../types';
import { API_ENDPOINTS } from '../constants';

export class FrankfurterFetcher extends CourseFetcher {
  get sourceName(): string { 
    return 'Frankfurter'; 
  }

  async fetchRate(currency: Currency): Promise<number> {
    const url = API_ENDPOINTS.FRANKFURTER.replace('{CUR}', currency);
    const res = await fetch(url);
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
