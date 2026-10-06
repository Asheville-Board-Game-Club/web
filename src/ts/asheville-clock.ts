import type { CalendarDate } from './calendar-date';

export const ASHEVILLE_TIME_ZONE = 'America/New_York';

export interface LocalDateTime {
  date: CalendarDate;
  minutesSinceMidnight: number;
}

const ashevilleFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: ASHEVILLE_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/** The Asheville wall-clock date and time at the given instant, whatever the viewer's own time zone. */
export function ashevilleDateTime(instant: Date): LocalDateTime {
  const parts = Object.fromEntries(ashevilleFormat.formatToParts(instant).map((part) => [part.type, part.value]));
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutesSinceMidnight: Number(parts.hour) * 60 + Number(parts.minute),
  };
}
