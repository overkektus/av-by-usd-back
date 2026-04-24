import { RateManager } from './RateManager';
import { CacheManager } from './CacheManager';
import { NbrbFetcher } from './NbrbFetcher';
import { ExchangeRateApiFetcher } from './ExchangeRateApiFetcher';
import { FrankfurterFetcher } from './FrankfurterFetcher';
import { DomFetcher } from './DomFetcher';

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
