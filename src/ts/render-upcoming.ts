import { formatShortDate, type CalendarDate } from './calendar-date';
import { escapeHtml, renderVenue } from './render-meetups';
import { formatTime } from './time-of-day';
import { UPCOMING_DAYS, type MeetupOccurrence } from './upcoming-meetups';

export const NO_UPCOMING_HTML = `<p>No meetups are scheduled in the next ${UPCOMING_DAYS} days.</p>`;

function renderOccurrence({ meetup, date }: MeetupOccurrence, today: CalendarDate): string {
  const shortDate = formatShortDate(date);
  const when = date === today ? `Today (${shortDate})` : shortDate;
  const times = `${formatTime(meetup['start-time'])} – ${formatTime(meetup['end-time'])}`;
  return (
    `<li><span class="upcoming-when">${escapeHtml(when)}</span> <span class="upcoming-time">${escapeHtml(times)}</span><br />` +
    `<a href="/meetups/#${encodeURIComponent(meetup.id)}">${escapeHtml(meetup.title)}</a> &middot; ${renderVenue(meetup.location)}</li>`
  );
}

export function renderUpcoming(occurrences: MeetupOccurrence[], today: CalendarDate): string {
  if (occurrences.length === 0) {
    return NO_UPCOMING_HTML;
  }
  return `<ul class="upcoming">${occurrences.map((occurrence) => renderOccurrence(occurrence, today)).join('')}</ul>`;
}
