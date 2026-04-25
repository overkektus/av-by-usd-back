import { CourseFetcher } from './fetchers/CourseFetcher';
import { CacheManager } from './CacheManager';
import { logger } from './utils/logger';

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
        logger.log(`Successfully fetched rate from ${fetcher.sourceName}: ${rate}`);
        
        await this.cacheManager.saveRate(rate);

        return rate;
      } catch (e) {
        logger.warn(`Failed to fetch from ${fetcher.sourceName}: ${e instanceof Error ? e.message : e}`);
      }
    }
    
    logger.error('All exchange rate fetchers failed.');
    throw new Error('All exchange rate fetchers failed.');
  }
}
