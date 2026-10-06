import type { LocalDateTime } from './asheville-clock';
import { addDays, dayOfWeek, type CalendarDate } from './calendar-date';
import type { Meetup, SpecialEvent } from './meetup';
import { minutesSinceMidnight } from './time-of-day';

export const UPCOMING_DAYS = 30;

export interface MeetupOccurrence {
  meetup: Meetup;
  date: CalendarDate;
  events: SpecialEvent[];
}

// AIDEV-NOTE: Assumes every meetup ends on the day it starts; an end time past midnight would need a date too.
function hasEnded(meetup: Meetup, date: CalendarDate, now: LocalDateTime): boolean {
  return date < now.date || (date === now.date && minutesSinceMidnight(meetup['end-time']) <= now.minutesSinceMidnight);
}

function eventsOn(meetup: Meetup, date: CalendarDate): SpecialEvent[] {
  return (meetup['special-events'] ?? []).filter((event) => event.dates.includes(date));
}

/** Meetups from today through the next `days` days, soonest first; today's drop off once they end. */
export function upcomingOccurrences(meetups: Meetup[], now: LocalDateTime, days: number): MeetupOccurrence[] {
  const occurrences: MeetupOccurrence[] = [];
  for (let offset = 0; offset < days; offset++) {
    const date = addDays(now.date, offset);
    for (const meetup of meetups) {
      if (meetup['day-of-week'] === dayOfWeek(date)) {
        occurrences.push({ meetup, date, events: eventsOn(meetup, date) });
      }
    }
  }
  return occurrences
    .filter((occurrence) => !hasEnded(occurrence.meetup, occurrence.date, now))
    .sort((a, b) => a.date.localeCompare(b.date) || minutesSinceMidnight(a.meetup['start-time']) - minutesSinceMidnight(b.meetup['start-time']));
}

/** The event's dates that haven't ended yet, soonest first; today's stays until the meetup ends. */
export function remainingDates(event: SpecialEvent, meetup: Meetup, now: LocalDateTime): CalendarDate[] {
  return event.dates.filter((date) => !hasEnded(meetup, date, now)).sort();
}
