import browser from 'webextension-polyfill';

export interface CachedRate {
  rate: number;
  timestamp: number;
}

export class CacheManager {
  private cacheKey: string;
  private ttlMs: number;

  constructor(cacheKey: string = 'av_by_usd_rate_cache', ttlMs: number = 1000 * 60 * 60) {
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
          console.log(`[AV.BY USD] Using cached rate: ${cached.rate} (from ${new Date(cached.timestamp).toLocaleTimeString()})`);
          return cached.rate;
        }
      }
    } catch (e) {
      console.warn('[AV.BY USD] Failed to read cache', e);
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
      console.warn('[AV.BY USD] Failed to write cache', e);
    }
  }
}
