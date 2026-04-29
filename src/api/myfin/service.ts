import browser from 'webextension-polyfill';
import { MyFinData, CachedMyFinData } from './types';
import { MyFinParser } from './parser';
import { logger } from '../utils/logger';
import { Currency } from '../types';

const MYFIN_BASE_URL = 'https://myfin.by/currency/';
const CACHE_KEY_PREFIX = 'myfin_rates_data_';
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export class MyFinService {
  private static instance: MyFinService;
  
  private constructor() {}

  public static getInstance(): MyFinService {
    if (!MyFinService.instance) {
      MyFinService.instance = new MyFinService();
    }
    return MyFinService.instance;
  }
  public async getRates(currency: Currency, force = false): Promise<MyFinData | null> {
    if (!force) {
      const cached = await this.loadFromCache(currency);
      if (cached) return cached;
    }

    try {
      const url = `${MYFIN_BASE_URL}${currency.toLowerCase()}`;
      logger.info(`Fetching ${currency} bank rates from myfin.by...`);
      const response = await fetch(url, {
        headers: {
          'Accept': 'text/html',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) throw new Error(`MyFin HTTP error: ${response.status}`);

      const html = await response.text();
      const data = MyFinParser.parse(html, currency);

      if (data.banks.length > 0) {
        await this.saveToCache(currency, data);
        return data;
      }

      throw new Error(`No ${currency} bank rates found in MyFin HTML`);
    } catch (e) {
      logger.error(`Failed to fetch MyFin rates for ${currency}`, e);
      return null;
    }
  }

  public async getRateForBank(currency: Currency, bankId: string | 'best'): Promise<number | null> {
    const data = await this.getRates(currency);
    if (!data) return null;

    if (bankId === 'best') return data.bestSell;

    const bank = data.banks.find(b => b.bankId === bankId);
    return bank ? bank.sellRate : data.bestSell;
  }

  private async loadFromCache(currency: Currency): Promise<MyFinData | null> {
    try {
      const key = `${CACHE_KEY_PREFIX}${currency.toLowerCase()}`;
      const storage = await browser.storage.local.get(key);
      const cached = storage[key] as CachedMyFinData | undefined;

      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
      }
    } catch (e) {
      logger.warn(`Failed to load MyFin cache for ${currency}`, e);
    }
    return null;
  }

  private async saveToCache(currency: Currency, data: MyFinData): Promise<void> {
    try {
      const key = `${CACHE_KEY_PREFIX}${currency.toLowerCase()}`;
      const cacheData: CachedMyFinData = {
        data,
        timestamp: Date.now()
      };
      await browser.storage.local.set({ [key]: cacheData });
    } catch (e) {
      logger.warn(`Failed to save MyFin cache for ${currency}`, e);
    }
  }
}

export const myFinService = MyFinService.getInstance();
