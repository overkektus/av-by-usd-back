import { CourseFetcher } from './CourseFetcher';
import { Currency, ExchangeRateApiResponse } from '../types';
import { API_ENDPOINTS } from '../constants';

export class ExchangeRateApiFetcher extends CourseFetcher {
  get sourceName(): string { 
    return 'ExchangeRate-API'; 
  }

  async fetchRate(currency: Currency): Promise<number> {
    const url = API_ENDPOINTS.EXCHANGE_RATE.replace('{CUR}', currency);
    const res = await fetch(url);
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
