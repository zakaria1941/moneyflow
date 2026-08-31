import { ISODateString, MonthKey } from '@/types';

export function todayISO(): ISODateString {
  return new Date().toISOString().slice(0, 10);
}

export function currentMonthKey(): MonthKey {
  return new Date().toISOString().slice(0, 7);
}

export function getMonthKey(date: ISODateString): MonthKey {
  return date.slice(0, 7);
}

export function addMonths(month: MonthKey, deltaMonths: number): MonthKey {
  const [year, m] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, m - 1 + deltaMonths, 1));
  return date.toISOString().slice(0, 7);
}

const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function formatMonthLabel(month: MonthKey): string {
  const [year, m] = month.split('-').map(Number);
  return `${MONTH_LABELS[m - 1]} ${year}`;
}

export function formatDateShort(date: ISODateString): string {
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** "Today" / "Yesterday" / e.g. "Mon, Aug 17" — for list section headers and detail rows. */
export function formatDateHeading(date: ISODateString): string {
  const today = todayISO();
  if (date === today) return 'Today';
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (date === yesterday.toISOString().slice(0, 10)) return 'Yesterday';
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}
