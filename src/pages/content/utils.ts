import { Currency } from "../../api/types";

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  'USD': '$',
  'EUR': '€',
  'RUB': '₽'
};

export function parseBynPrice(text: string): number {
  const cleanText = text.replace(/[^\d]/g, '');
  const amount = parseInt(cleanText, 10);
  return isNaN(amount) ? 0 : amount;
}

export function formatConvertedPrice(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  const showDecimals = amount < 100;

  const formatted = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);

  return `≈ ${formatted} ${symbol}`;
}
