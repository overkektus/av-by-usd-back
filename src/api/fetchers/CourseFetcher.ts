import { AllRates, Currency } from '../types';

export abstract class CourseFetcher {
  /**
   * Returns the rate of the given currency in BYN
   */
  abstract fetchRate(currency: Currency): Promise<number>;

  /**
   * Returns all supported rates (USD, EUR, RUB) in BYN
   */
  abstract fetchAllRates(): Promise<Partial<AllRates>>;
  
  /**
   * Name of the exchange rate source
   */
  abstract get sourceName(): string;
}
