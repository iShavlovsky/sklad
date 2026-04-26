import 'dayjs/locale/ru';

import dayjs from 'dayjs';

dayjs.locale('ru');

export function formatDate(dateValue: string): string {
  return dayjs(dateValue).format('DD.MM.YYYY');
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function todayIsoDate(): string {
  return dayjs().format('YYYY-MM-DD');
}
