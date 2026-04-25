import { Currency } from '../types';

export abstract class CourseFetcher {
  /**
   * Returns the rate of the given currency in BYN (how many BYN is 1 unit of currency)
   */
  abstract fetchRate(currency: Currency): Promise<number>;
  
  /**
   * Name of the exchange rate source
   */
  abstract get sourceName(): string;
}
