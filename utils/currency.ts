import { CurrencyCode } from '@/types';

const SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
};

/** Currencies the app can format/display — keep in sync with SYMBOLS above. */
export const SUPPORTED_CURRENCIES: CurrencyCode[] = ['USD', 'EUR', 'GBP'];

export function toMajorUnits(minorUnits: number): number {
  return minorUnits / 100;
}

export function toMinorUnits(majorUnits: number): number {
  return Math.round(majorUnits * 100);
}

export function formatCurrency(minorUnits: number, currency: CurrencyCode = 'USD'): string {
  const amount = toMajorUnits(Math.abs(minorUnits));
  const sign = minorUnits < 0 ? '-' : '';
  const symbol = SYMBOLS[currency] ?? `${currency} `;
  return `${sign}${symbol}${amount.toFixed(2)}`;
}
