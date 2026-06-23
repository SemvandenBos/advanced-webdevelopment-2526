import { Timestamp } from 'firebase/firestore';

function formatISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function todayISO(): string {
  return formatISO(new Date());
}

export function timestampToISO(ts: Timestamp): string {
  return formatISO(ts.toDate());
}

export function isPastISODate(dateISO: string): boolean {
  return dateISO < todayISO();
}

export function isAfterCategoryEndDate(dateISO: string, endDate?: Timestamp): boolean {
  if (!endDate) return false;
  return dateISO > timestampToISO(endDate);
}
