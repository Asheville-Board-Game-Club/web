import type { LocalDateTime } from './asheville-clock';
import { addDays, dayOfWeek, type CalendarDate } from './calendar-date';
import type { Meetup } from './meetup';
import { minutesSinceMidnight } from './time-of-day';

export const UPCOMING_DAYS = 30;

export interface MeetupOccurrence {
  meetup: Meetup;
  date: CalendarDate;
}

// AIDEV-NOTE: Assumes every meetup ends on the day it starts; an end time past midnight would need a date too.
function isOver(occurrence: MeetupOccurrence, now: LocalDateTime): boolean {
  return occurrence.date === now.date && minutesSinceMidnight(occurrence.meetup['end-time']) <= now.minutesSinceMidnight;
}

/** Meetups from today through the next `days` days, soonest first; today's drop off once they end. */
export function upcomingOccurrences(meetups: Meetup[], now: LocalDateTime, days: number): MeetupOccurrence[] {
  const occurrences: MeetupOccurrence[] = [];
  for (let offset = 0; offset < days; offset++) {
    const date = addDays(now.date, offset);
    for (const meetup of meetups) {
      if (meetup['day-of-week'] === dayOfWeek(date)) {
        occurrences.push({ meetup, date });
      }
    }
  }
  return occurrences
    .filter((occurrence) => !isOver(occurrence, now))
    .sort((a, b) => a.date.localeCompare(b.date) || minutesSinceMidnight(a.meetup['start-time']) - minutesSinceMidnight(b.meetup['start-time']));
}
