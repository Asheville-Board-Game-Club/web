import type { DayOfWeek } from './meetup';

/** A calendar date as "YYYY-MM-DD", with no time zone. */
export type CalendarDate = string;

export const DAYS_OF_WEEK: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Calendar arithmetic is done on UTC midnights so daylight saving changes can't shift a date.
function toUtcMidnight(date: CalendarDate): Date {
  return new Date(`${date}T00:00:00Z`);
}

export function addDays(date: CalendarDate, days: number): CalendarDate {
  const result = toUtcMidnight(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

export function dayOfWeek(date: CalendarDate): DayOfWeek {
  return DAYS_OF_WEEK[toUtcMidnight(date).getUTCDay()] as DayOfWeek;
}

/** e.g. "Wed, Oct 14" */
export function formatShortDate(date: CalendarDate): string {
  return toUtcMidnight(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
}
