import { LOG_PREFIX } from '../constants';

export const logger = {
  log: (message: string, ...args: any[]) => {
    console.log(`${LOG_PREFIX} ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`${LOG_PREFIX} ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`${LOG_PREFIX} ${message}`, ...args);
  }
};
