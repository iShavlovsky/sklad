import { isNumber } from './type-guards.ts';

export function nowIso(): string {
  return new Date().toISOString();
}

export function currentMonthKey(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${month}`;
}

export function monthKey(dateValue: string): string {
  return dateValue.slice(0, 7);
}

export type DateInput =
  | Date
  | number // timestamp (sec or ms)
  | string // ISO, RFC, etc.
  | null
  | undefined;

export type DateFormat = Intl.DateTimeFormatOptions | 'relative';

function normalizeToDate(value: DateInput): Date | null {
  if (value == null) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (isNumber(value)) {
    const ms = value < 1e12 ? value * 1000 : value;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // string
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatRelative(from: Date, now = new Date(), locale?: string): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const diffMs = from.getTime() - now.getTime();

  const abs = Math.abs(diffMs);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (abs < minute) return rtf.format(Math.round(diffMs / 1000), 'second');
  if (abs < hour) return rtf.format(Math.round(diffMs / minute), 'minute');
  if (abs < day) return rtf.format(Math.round(diffMs / hour), 'hour');
  return rtf.format(Math.round(diffMs / day), 'day');
}

export function formatDate(
  value: DateInput,
  {
    locale,
    format = { day: '2-digit', month: 'short' },
    now,
  }: {
    locale?: string;
    format?: DateFormat;
    now?: Date;
  } = {}
): { date: Date | null; label: string } {
  const date = normalizeToDate(value);
  if (!date) return { date: null, label: '' };

  if (format === 'relative') {
    return { date, label: formatRelative(date, now, locale) };
  }

  const dtf = new Intl.DateTimeFormat(locale, format);
  return { date, label: dtf.format(date) };
}
