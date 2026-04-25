import { CourseFetcher } from './fetchers/CourseFetcher';
import { CacheManager } from './CacheManager';
import { logger } from './utils/logger';
import { Currency } from './types';

export class RateManager {
  private fetchers: CourseFetcher[];
  private cacheManager: CacheManager;

  constructor(fetchers: CourseFetcher[], cacheManager: CacheManager) {
    this.fetchers = fetchers;
    this.cacheManager = cacheManager;
  }

  async fetchBestRate(currency: Currency): Promise<number> {
    const cachedRate = await this.cacheManager.getValidRate(currency);
    if (cachedRate !== null) {
      return cachedRate;
    }

    for (const fetcher of this.fetchers) {
      try {
        const rate = await fetcher.fetchRate(currency);
        logger.log(`Successfully fetched ${currency} rate from ${fetcher.sourceName}: ${rate}`);
        
        await this.cacheManager.saveRate(currency, rate);

        return rate;
      } catch (e) {
        logger.warn(`Failed to fetch ${currency} from ${fetcher.sourceName}: ${e instanceof Error ? e.message : e}`);
      }
    }
    
    logger.error(`All exchange rate fetchers failed for ${currency}.`);
    throw new Error(`All exchange rate fetchers failed for ${currency}.`);
  }
}
