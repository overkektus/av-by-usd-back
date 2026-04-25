import { CourseFetcher } from './CourseFetcher';
import { AllRates, Currency, FrankfurterV2Response } from '../types';
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

  async fetchAllRates(): Promise<Partial<AllRates>> {
    const url = API_ENDPOINTS.FRANKFURTER.replace('{CUR}', 'USD');
    const res = await fetch(url);
    if (!res.ok) throw new Error('Frankfurter bulk fetch failed');
    
    const data = (await res.json()) as FrankfurterV2Response;
    const result: Partial<AllRates> = {};
    
    const bynItem = data.find(item => item.quote === 'BYN');
    if (bynItem && typeof bynItem.rate === 'number') {
      const bynPerUsd = bynItem.rate;
      result.USD = bynPerUsd;
      
      const eurItem = data.find(item => item.quote === 'EUR');
      if (eurItem && typeof eurItem.rate === 'number') {
        result.EUR = bynPerUsd / eurItem.rate;
      }
      
      const rubItem = data.find(item => item.quote === 'RUB');
      if (rubItem && typeof rubItem.rate === 'number') {
        result.RUB = bynPerUsd / rubItem.rate;
      }
    }
    
    return result;
  }
}
