export interface BankRate {
  bankId: string;
  bankName: string;
  buyRate: number;
  sellRate: number;
}

export interface MyFinData {
  bestBuy: number;
  bestSell: number;
  banks: BankRate[];
  fetchedAt: number;
}

export interface BankConfig {
  id: string;
  name: string;
  enabled: boolean;
}

export interface CachedMyFinData {
  data: MyFinData;
  timestamp: number;
}
