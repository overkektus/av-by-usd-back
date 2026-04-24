import { RateManager } from './RateManager';
import { CacheManager } from './CacheManager';
import { NbrbFetcher } from './NbrbFetcher';
import { ExchangeRateApiFetcher } from './ExchangeRateApiFetcher';
import { FrankfurterFetcher } from './FrankfurterFetcher';
import { DomFetcher } from './DomFetcher';

// Instantiate the manager with priority order and cache
export const rateManager = new RateManager(
  [
    new DomFetcher(), // Ultimate fallback from page DOM
    new NbrbFetcher(),
    new ExchangeRateApiFetcher(),
    new FrankfurterFetcher(),
  ],
  new CacheManager()
);
