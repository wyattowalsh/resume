import { format } from 'date-fns';

export function formatMonthYear(isoDate: string) {
  const [year, month, day] = isoDate.split('-').map(Number);
  const safeDay = Number.isFinite(day) && day > 0 ? day : 1;

  // Use a local date to avoid month shifts from UTC parsing.
  return format(new Date(year, month - 1, safeDay), 'MMM yyyy');
}
