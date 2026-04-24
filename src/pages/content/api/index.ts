import { RateManager } from './RateManager';
import { NbrbFetcher } from './NbrbFetcher';
import { ExchangeRateApiFetcher } from './ExchangeRateApiFetcher';
import { FrankfurterFetcher } from './FrankfurterFetcher';

// Instantiate the manager with priority order
export const rateManager = new RateManager([
  new NbrbFetcher(),
  new ExchangeRateApiFetcher(),
  new FrankfurterFetcher(),
]);
