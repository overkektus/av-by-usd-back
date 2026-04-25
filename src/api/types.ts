export type Currency = 'USD' | 'EUR' | 'RUB';

export interface NbrbResponse {
  Cur_ID: number;
  Date: string;
  Cur_Abbreviation: string;
  Cur_Scale: number;
  Cur_Name: string;
  Cur_OfficialRate: number;
}

export interface ExchangeRateApiResponse {
  result: string;
  base_code: string;
  rates: {
    [currencyCode: string]: number;
  };
}

export interface FrankfurterV2Rate {
  date: string;
  base: string;
  quote: string;
  rate: number;
}

export type FrankfurterV2Response = FrankfurterV2Rate[];
