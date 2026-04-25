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

  async fetchBestRate(currency: Currency, force = false): Promise<number> {
    if (!force) {
      const cachedRate = await this.cacheManager.getValidRate(currency);
      if (cachedRate !== null) {
        return cachedRate;
      }
    }

    await this.syncAllRates();

    const freshRate = await this.cacheManager.getValidRate(currency);

    if (freshRate !== null) {
      return freshRate;
    }

    throw new Error(`Failed to obtain exchange rate for ${currency} even after sync.`);
  }

  async syncAllRates(): Promise<void> {
    for (const fetcher of this.fetchers) {
      try {
        const rates = await fetcher.fetchAllRates();
        const currencies = Object.keys(rates) as Currency[];

        if (currencies.length === 0) continue;

        for (const cur of currencies) {
          const val = rates[cur];
          if (typeof val === 'number') {
            await this.cacheManager.saveRate(cur, val);
          }
        }

        logger.log(`Successfully synced all rates from ${fetcher.sourceName}`);
        return;
      } catch (e) {
        logger.warn(`Bulk fetch failed from ${fetcher.sourceName}: ${e instanceof Error ? e.message : e}`);
      }
    }
  }
}
