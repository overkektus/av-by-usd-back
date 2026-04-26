import browser from 'webextension-polyfill';
import { PriceTargetConfig, RemoteConfigPayload, CachedRemoteConfig } from './types';
import { TARGET_CONFIGS as LOCAL_CONFIGS } from './configs';
import { logger } from '../../../api/utils/logger';

const DEFAULT_CONFIG_URL = 'https://raw.githubusercontent.com/overkektus/av-by-usd-back/main/remote-config.json';
const DEFAULT_TTL = 1000 * 60 * 60 * 1; // 1 hour

const CONFIG_URL = import.meta.env.VITE_REMOTE_CONFIG_URL || DEFAULT_CONFIG_URL;
const CACHE_KEY = 'remote_selectors_config';
const CACHE_TTL = Number(import.meta.env.VITE_REMOTE_CONFIG_TTL) || DEFAULT_TTL;

export class RemoteConfigManager {
  private static instance: RemoteConfigManager;
  private currentConfigs: PriceTargetConfig[] = LOCAL_CONFIGS;
  private lastUpdateTimestamp: number = 0;
  private updatePromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): RemoteConfigManager {
    if (!RemoteConfigManager.instance) {
      RemoteConfigManager.instance = new RemoteConfigManager();
    }
    return RemoteConfigManager.instance;
  }

  public async initialize(): Promise<void> {
    // If an initialization is already in progress, return its promise
    if (this.updatePromise) {
      return this.updatePromise;
    }

    this.updatePromise = (async () => {
      await this.loadFromCache();
      
      if (!this.isCacheValid(this.lastUpdateTimestamp)) {
        await this.updateFromRemote();
      }
    })();
    
    try {
      await this.updatePromise;
    } finally {
      this.updatePromise = null;
    }
  }

  public getConfigs(): PriceTargetConfig[] {
    return this.currentConfigs;
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < CACHE_TTL;
  }

  private validatePayload(data: any): data is RemoteConfigPayload {
    return (
      data && 
      typeof data === 'object' && 
      Array.isArray(data.selectors) && 
      data.selectors.every((s: any) => typeof s.selector === 'string')
    );
  }

  private async loadFromCache(): Promise<void> {
    try {
      const storage = await browser.storage.local.get(CACHE_KEY);
      const cached = storage[CACHE_KEY] as CachedRemoteConfig | undefined;
      
      if (cached) {
        this.lastUpdateTimestamp = cached.timestamp;
        if (this.isCacheValid(cached.timestamp)) {
          logger.info('Using cached remote selectors', { count: cached.configs.length });
          this.applyRemoteConfigs(cached.configs);
        } else {
          logger.info('Cache expired, removing stale data');
          await browser.storage.local.remove(CACHE_KEY);
        }
      }
    } catch (e) {
      logger.error('Failed to load remote config from cache', e);
    }
  }

  private async updateFromRemote(): Promise<void> {
    try {
      logger.info('Fetching remote config from GitHub...', { url: CONFIG_URL });
      const response = await fetch(`${CONFIG_URL}?t=${Date.now()}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const payload = await response.json();
      
      if (this.validatePayload(payload)) {
        const now = Date.now();
        logger.info('Remote config updated successfully', { count: payload.selectors.length });
        this.applyRemoteConfigs(payload.selectors);
        this.lastUpdateTimestamp = now;
        await this.saveToCache(payload.selectors, now);
      } else {
        logger.warn('Invalid remote config payload received');
      }
    } catch (e) {
      logger.warn('Could not fetch remote config, staying with current');
    }
  }

  private async saveToCache(configs: PriceTargetConfig[], timestamp: number): Promise<void> {
    const cacheData: CachedRemoteConfig = { configs, timestamp };
    await browser.storage.local.set({ [CACHE_KEY]: cacheData });
  }

  private applyRemoteConfigs(remoteSelectors: PriceTargetConfig[]): void {
    const merged = [...LOCAL_CONFIGS];
    for (const remote of remoteSelectors) {
      if (!merged.some(c => c.selector === remote.selector)) {
        merged.push(remote);
      }
    }
    this.currentConfigs = merged;
  }
}

export const remoteConfigManager = RemoteConfigManager.getInstance();
