import browser from 'webextension-polyfill';
import { PriceTargetConfig, RemoteConfigPayload, CachedRemoteConfig } from './types';
import { TARGET_CONFIGS as LOCAL_CONFIGS } from './configs';
import { logger } from '../../../api/utils/logger';

const CONFIG_URL = 'https://raw.githubusercontent.com/overkektus/av-by-usd-back/main/remote-config.json';
const CACHE_KEY = 'remote_selectors_config';
const CACHE_TTL = 1000 * 60 * 60 * 1; // 1 hour

export class RemoteConfigManager {
  private static instance: RemoteConfigManager;
  private currentConfigs: PriceTargetConfig[] = LOCAL_CONFIGS;
  private lastUpdateTimestamp: number = 0;

  private constructor() {}

  public static getInstance(): RemoteConfigManager {
    if (!RemoteConfigManager.instance) {
      RemoteConfigManager.instance = new RemoteConfigManager();
    }
    return RemoteConfigManager.instance;
  }

  public async initialize(): Promise<void> {
    await this.loadFromCache();
    
    // Refresh from GitHub only if cache is missing or expired
    if (!this.isCacheValid(this.lastUpdateTimestamp)) {
      this.updateFromRemote().catch(err => logger.error('Remote config background update failed', err));
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
        }
      }
    } catch (e) {
      logger.error('Failed to load remote config from cache', e);
    }
  }

  private async updateFromRemote(): Promise<void> {
    try {
      const response = await fetch(`${CONFIG_URL}?t=${Date.now()}`);
      if (!response.ok) return;

      const payload = await response.json();
      
      if (this.validatePayload(payload)) {
        const now = Date.now();
        logger.info('Remote config updated from GitHub', { count: payload.selectors.length });
        this.applyRemoteConfigs(payload.selectors);
        this.lastUpdateTimestamp = now;
        await this.saveToCache(payload.selectors, now);
      } else {
        logger.warn('Invalid remote config payload received from GitHub');
      }
    } catch (e) {
      logger.warn('Could not fetch remote config, staying with defaults');
    }
  }

  private async saveToCache(configs: PriceTargetConfig[], timestamp: number): Promise<void> {
    const cacheData: CachedRemoteConfig = {
      configs,
      timestamp
    };
    await browser.storage.local.set({ [CACHE_KEY]: cacheData });
  }

  private applyRemoteConfigs(remoteSelectors: PriceTargetConfig[]): void {
    const merged = [...LOCAL_CONFIGS];
    
    // Add remote selectors only if they are unique
    for (const remote of remoteSelectors) {
      const isAlreadyDefined = merged.some(c => c.selector === remote.selector);
      if (!isAlreadyDefined) {
        merged.push(remote);
      }
    }
    
    this.currentConfigs = merged;
  }
}

export const remoteConfigManager = RemoteConfigManager.getInstance();
