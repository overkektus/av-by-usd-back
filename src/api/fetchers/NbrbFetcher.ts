import { AllRates, Currency, NbrbResponse } from '../types';
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

  async fetchAllRates(): Promise<Partial<AllRates>> {
    const res = await fetch('https://api.nbrb.by/exrates/rates?periodicity=0');
    if (!res.ok) throw new Error('NBRB bulk fetch failed');
    
    const data = (await res.json()) as NbrbResponse[];
    const result: Partial<AllRates> = {};
    
    const targets: Currency[] = ['USD', 'EUR', 'RUB'];
    for (const cur of targets) {
      const found = data.find(item => item.Cur_Abbreviation === cur);
      if (found && typeof found.Cur_OfficialRate === 'number' && found.Cur_Scale) {
        result[cur] = found.Cur_OfficialRate / found.Cur_Scale;
      }
    }
    
    return result;
  }
}
