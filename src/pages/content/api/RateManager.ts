import { CourseFetcher } from './CourseFetcher';

export class RateManager {
  private fetchers: CourseFetcher[];
  private readonly fallbackRate = 3.2;

  constructor(fetchers: CourseFetcher[]) {
    this.fetchers = fetchers;
  }

  async fetchBestRate(): Promise<number> {
    for (const fetcher of this.fetchers) {
      try {
        const rate = await fetcher.fetchRate();
        console.log(`[AV.BY USD] Successfully fetched rate from ${fetcher.sourceName}: ${rate}`);
        return rate;
      } catch (e) {
        console.warn(`[AV.BY USD] Failed to fetch rate from ${fetcher.sourceName}:`, e);
      }
    }
    console.warn(`[AV.BY USD] All fetchers failed. Using fallback rate: ${this.fallbackRate}`);
    return this.fallbackRate;
  }
}
