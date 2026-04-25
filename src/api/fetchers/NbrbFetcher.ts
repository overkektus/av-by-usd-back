import { CourseFetcher } from './CourseFetcher';
import type { NbrbResponse } from '../types';
import { API_ENDPOINTS } from '../constants';

export class NbrbFetcher extends CourseFetcher {
  get sourceName(): string { 
    return 'NBRB'; 
  }

  async fetchRate(): Promise<number> {
    const res = await fetch(API_ENDPOINTS.NBRB);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = (await res.json()) as NbrbResponse;
    if (data && typeof data.Cur_OfficialRate === 'number') {
      return data.Cur_OfficialRate;
    }
    
    throw new Error('Invalid NBRB data format');
  }
}
