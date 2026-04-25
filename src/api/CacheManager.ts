import browser from 'webextension-polyfill';
import { CACHE_KEY, CACHE_TTL_MS } from './constants';
import { logger } from './utils/logger';
import { Currency } from './types';

interface CachedRate {
  rate: number;
  timestamp: number;
}

export class CacheManager {
  private cacheKey: string;
  private ttlMs: number;

  constructor(cacheKey: string = CACHE_KEY, ttlMs: number = CACHE_TTL_MS) {
    this.cacheKey = cacheKey;
    this.ttlMs = ttlMs;
  }

  private getCurrencyKey(currency: Currency): string {
    return `${this.cacheKey}_${currency.toLowerCase()}`;
  }

  async getValidRate(currency: Currency): Promise<number | null> {
    try {
      const key = this.getCurrencyKey(currency);
      const storage = await browser.storage.local.get(key);
      const cached = storage[key] as CachedRate | undefined;

      if (cached && cached.timestamp) {
        const now = Date.now();
        if (now - cached.timestamp < this.ttlMs) {
          logger.log(`[${currency}] Using cached rate: ${cached.rate}`);
          return cached.rate;
        }
      }
    } catch (e) {
      logger.warn(`[${currency}] Failed to read cache`, e);
    }
    return null;
  }

  async saveRate(currency: Currency, rate: number): Promise<void> {
    try {
      const key = this.getCurrencyKey(currency);
      await browser.storage.local.set({
        [key]: {
          rate,
          timestamp: Date.now()
        }
      });
    } catch (e) {
      logger.warn(`[${currency}] Failed to write cache`, e);
    }
  }
}
