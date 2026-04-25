import { Currency, NbrbResponse } from '../types';
import { API_ENDPOINTS } from '../constants';
import { CourseFetcher } from './CourseFetcher';

export class NbrbFetcher extends CourseFetcher {
  get sourceName(): string { 
    return 'NBRB'; 
  }

  async fetchRate(currency: Currency): Promise<number> {
    const url = API_ENDPOINTS.NBRB.replace('{CUR}', currency);
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = (await res.json()) as NbrbResponse;
    if (data && typeof data.Cur_OfficialRate === 'number' && data.Cur_Scale) {
      // RUB is usually 100 units per rate, so we divide by scale
      return data.Cur_OfficialRate / data.Cur_Scale;
    }
    
    throw new Error('Invalid NBRB data format');
  }
}
