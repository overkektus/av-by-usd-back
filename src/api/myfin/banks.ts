import { BankConfig } from './types';

export const SUPPORTED_BANKS: BankConfig[] = [
  { id: 'belarusbank', name: 'Беларусбанк', enabled: true },
  { id: 'priorbank', name: 'Приорбанк', enabled: true },
  { id: 'alfabank', name: 'Альфа Банк', enabled: true },
  { id: 'bps-sberbank', name: 'Сбер Банк', enabled: true },
  { id: 'mtbank', name: 'МТБанк', enabled: true },
  { id: 'bnbank', name: 'БНБ-Банк', enabled: true },
  { id: 'belagroprombank', name: 'Белагропромбанк', enabled: true },
  { id: 'belinvestbank', name: 'Белинвестбанк', enabled: true },
  { id: 'bvebank', name: 'БелВЭБ', enabled: true },
  { id: 'vtb', name: 'Банк ВТБ', enabled: true }
];
