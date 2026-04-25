import { RateManager } from './RateManager';
import { CacheManager } from './CacheManager';
import { DomFetcher, NbrbFetcher, ExchangeRateApiFetcher, FrankfurterFetcher } from './fetchers';

// Instantiate the manager with priority order and cache
export const rateManager = new RateManager(
  [
    new DomFetcher(), // Try current page first (fastest, most accurate)
    new NbrbFetcher(),
    new ExchangeRateApiFetcher(),
    new FrankfurterFetcher()
  ],
  new CacheManager()
);
