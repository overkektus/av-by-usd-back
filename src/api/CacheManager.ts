import browser from 'webextension-polyfill';
import { CACHE_KEY, CACHE_TTL_MS } from './constants';
import { logger } from './utils/logger';

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

  async getValidRate(): Promise<number | null> {
    try {
      const storage = await browser.storage.local.get(this.cacheKey);
      const cached = storage[this.cacheKey] as CachedRate | undefined;

      if (cached && cached.timestamp) {
        const now = Date.now();
        if (now - cached.timestamp < this.ttlMs) {
          logger.log(`Using cached rate: ${cached.rate} (from ${new Date(cached.timestamp).toLocaleTimeString()})`);
          return cached.rate;
        }
      }
    } catch (e) {
      logger.warn('Failed to read cache', e);
    }
    return null;
  }

  async saveRate(rate: number): Promise<void> {
    try {
      await browser.storage.local.set({
        [this.cacheKey]: {
          rate,
          timestamp: Date.now()
        }
      });
    } catch (e) {
      logger.warn('Failed to write cache', e);
    }
  }
}
