import { CourseFetcher } from './CourseFetcher';
import type { ExchangeRateApiResponse } from '../types';
import { API_ENDPOINTS } from '../constants';

export class ExchangeRateApiFetcher extends CourseFetcher {
  get sourceName(): string { 
    return 'ExchangeRate-API'; 
  }

  async fetchRate(): Promise<number> {
    const res = await fetch(API_ENDPOINTS.EXCHANGE_RATE);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = (await res.json()) as ExchangeRateApiResponse;
    if (data && data.rates && typeof data.rates.BYN === 'number') {
      return data.rates.BYN;
    }
    
    throw new Error('BYN not found in ExchangeRate-API response');
  }
}
