export abstract class CourseFetcher {
  /**
   * Returns the rate of USD in BYN (how many BYN is 1 USD)
   */
  abstract fetchRate(): Promise<number>;
  
  /**
   * Name of the exchange rate source
   */
  abstract get sourceName(): string;
}
