import { CourseFetcher } from './CourseFetcher';
import { AllRates, Currency, ExchangeRateApiResponse } from '../types';
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

  async fetchAllRates(): Promise<Partial<AllRates>> {
    const url = API_ENDPOINTS.EXCHANGE_RATE.replace('{CUR}', 'USD');
    const res = await fetch(url);
    if (!res.ok) throw new Error('ExchangeRate-API bulk fetch failed');
    
    const data = (await res.json()) as ExchangeRateApiResponse;
    const result: Partial<AllRates> = {};
    
    if (data && data.rates && typeof data.rates.BYN === 'number') {
      const bynPerUsd = data.rates.BYN;
      result.USD = bynPerUsd;
      
      if (typeof data.rates.EUR === 'number') {
        result.EUR = bynPerUsd / data.rates.EUR;
      }
      if (typeof data.rates.RUB === 'number') {
        result.RUB = bynPerUsd / data.rates.RUB;
      }
    }
    
    return result;
  }
}
