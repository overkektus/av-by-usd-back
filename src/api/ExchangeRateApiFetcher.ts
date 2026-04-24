import { CourseFetcher } from './CourseFetcher';
import type { ExchangeRateApiResponse } from './types';

export class ExchangeRateApiFetcher extends CourseFetcher {
  get sourceName(): string { 
    return 'ExchangeRate-API'; 
  }

  async fetchRate(): Promise<number> {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
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
