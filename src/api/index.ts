import { RateManager } from './RateManager';
import { CacheManager } from './CacheManager';
import { NbrbFetcher } from './NbrbFetcher';
import { ExchangeRateApiFetcher } from './ExchangeRateApiFetcher';
import { FrankfurterFetcher } from './FrankfurterFetcher';

// Instantiate the manager with priority order and cache
export const rateManager = new RateManager(
  [
    new NbrbFetcher(),
    new ExchangeRateApiFetcher(),
    new FrankfurterFetcher()
  ],
  new CacheManager()
);
