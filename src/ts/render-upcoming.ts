import { formatShortDate, type CalendarDate } from './calendar-date';
import type { SpecialEvent } from './meetup';
import { eventStyle, escapeHtml, renderVenue } from './render-meetups';
import { formatTime } from './time-of-day';
import { UPCOMING_DAYS, type MeetupOccurrence } from './upcoming-meetups';

export const NO_UPCOMING_HTML = `<p>No meetups are scheduled in the next ${UPCOMING_DAYS} days.</p>`;

// Sharing one name makes the browser keep at most one event open at a time.
const EVENT_GROUP = 'upcoming-event';

function renderEventDetails(event: SpecialEvent): string {
  const name = escapeHtml(event.name);
  // The name beside it says what the picture shows, so the image is decorative here.
  const label = event.image ? `${name} <img src="${escapeHtml(event.image.src)}" alt="" />` : `&#9733; ${name}`;
  return `<details name="${EVENT_GROUP}"><summary>${label}</summary><p>${escapeHtml(event.description)}</p></details>`;
}

function renderEvents(events: SpecialEvent[]): string {
  if (events.length === 0) {
    return '';
  }
  const items = events.map((event) => `<li${eventStyle(event)}>${renderEventDetails(event)}</li>`);
  return `<ul class="upcoming-events">${items.join('')}</ul>`;
}

function renderOccurrence({ meetup, date, events }: MeetupOccurrence, today: CalendarDate): string {
  const shortDate = formatShortDate(date);
  const when = date === today ? `Today (${shortDate})` : shortDate;
  const times = `${formatTime(meetup['start-time'])} – ${formatTime(meetup['end-time'])}`;
  return (
    `<li><span class="upcoming-when">${escapeHtml(when)}</span> <span class="upcoming-time">${escapeHtml(times)}</span><br />` +
    `<a href="/meetups/#${encodeURIComponent(meetup.id)}">${escapeHtml(meetup.title)}</a> &middot; ${renderVenue(meetup.location)}${renderEvents(events)}</li>`
  );
}

export function renderUpcoming(occurrences: MeetupOccurrence[], today: CalendarDate): string {
  if (occurrences.length === 0) {
    return NO_UPCOMING_HTML;
  }
  return `<ul class="upcoming">${occurrences.map((occurrence) => renderOccurrence(occurrence, today)).join('')}</ul>`;
}
