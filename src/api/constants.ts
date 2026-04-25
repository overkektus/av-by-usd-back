export const CACHE_KEY = 'av_by_usd_rate_cache';
export const CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

export const API_ENDPOINTS = {
  NBRB: 'https://api.nbrb.by/exrates/rates/USD?parammode=2',
  EXCHANGE_RATE: 'https://open.er-api.com/v6/latest/USD',
  FRANKFURTER: 'https://api.frankfurter.dev/v1/latest?base=USD&symbols=BYN'
};

export const LOG_PREFIX = '[AV.BY USD]';
