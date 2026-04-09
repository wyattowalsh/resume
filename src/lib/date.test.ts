import { describe, expect, it } from 'vitest';
import { formatMonthYear } from './date';

describe('formatMonthYear', () => {
  it('formats ISO dates as month and year', () => {
    expect(formatMonthYear('2024-11-01')).toBe('Nov 2024');
  });

  it('defaults missing or zero days to the first of the month', () => {
    expect(formatMonthYear('2021-01-00')).toBe('Jan 2021');
    expect(formatMonthYear('2021-01')).toBe('Jan 2021');
  });
});
