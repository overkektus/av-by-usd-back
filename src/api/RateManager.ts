import { CourseFetcher } from './fetchers/CourseFetcher';
import { CacheManager } from './CacheManager';

export class RateManager {
  private fetchers: CourseFetcher[];
  private cacheManager: CacheManager;

  constructor(fetchers: CourseFetcher[], cacheManager: CacheManager) {
    this.fetchers = fetchers;
    this.cacheManager = cacheManager;
  }

  async fetchBestRate(): Promise<number> {
    const cachedRate = await this.cacheManager.getValidRate();
    if (cachedRate !== null) {
      return cachedRate;
    }

    for (const fetcher of this.fetchers) {
      try {
        const rate = await fetcher.fetchRate();
        console.log(`[AV.BY USD] Successfully fetched rate from ${fetcher.sourceName}: ${rate}`);
        
        await this.cacheManager.saveRate(rate);

        return rate;
      } catch (e) {
        // We stay silent here because failing to find a rate in the DOM or from one of the APIs
        // is an expected behavior in a fallback chain.
      }
    }
    
    console.error('[AV.BY USD] All exchange rate fetchers failed.');
    throw new Error('All exchange rate fetchers failed.');
  }
}

