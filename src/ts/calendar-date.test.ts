import { addDays, dayOfWeek, formatShortDate } from './calendar-date';

describe('addDays', () => {
  it.each([
    ['2026-10-07', 0, '2026-10-07'],
    ['2026-10-07', 7, '2026-10-14'],
    ['2026-10-28', 5, '2026-11-02'],
    ['2026-12-30', 3, '2027-01-02'],
    ['2026-10-31', 2, '2026-11-02'],
  ])('%s plus %i days is %s', (date, days, expected) => {
    expect(addDays(date, days)).toBe(expected);
  });
});

describe('dayOfWeek', () => {
  it.each([
    ['2026-10-04', 'Sunday'],
    ['2026-10-07', 'Wednesday'],
    ['2026-10-10', 'Saturday'],
  ])('%s is a %s', (date, expected) => {
    expect(dayOfWeek(date)).toBe(expected);
  });
});

describe('formatShortDate', () => {
  it.each([
    ['2026-10-07', 'Wed, Oct 7'],
    ['2026-11-14', 'Sat, Nov 14'],
  ])('formats %s as %s', (date, expected) => {
    expect(formatShortDate(date)).toBe(expected);
  });
});
