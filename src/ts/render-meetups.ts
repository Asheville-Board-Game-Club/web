import type { LocalDateTime } from './asheville-clock';
import { formatLongDate, formatShortDate, type CalendarDate } from './calendar-date';
import type { MapImage, Meetup, MeetupLocation, MeetupsData, SpecialEvent } from './meetup';
import { specialEventId } from './special-event-id';
import { formatTime } from './time-of-day';
import { hasPassed, isTentative, remainingDates } from './upcoming-meetups';

// Enough for element text and double-quoted attributes, which is all this file produces.
const HTML_ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '"': '&quot;' };

// The JSON is edited by hand, so treat every value as text rather than markup.
export function escapeHtml(text: string): string {
  return text.replace(/[&<"]/g, (character) => HTML_ESCAPES[character] ?? character);
}

/** A Tentative stamp, with a leading space, while the meetup is still tentative; otherwise nothing. */
export function renderTentativeStamp(meetup: Meetup, today: CalendarDate): string {
  return isTentative(meetup, today) ? ' <span class="tentative-stamp">Tentative</span>' : '';
}

export function describeSchedule(meetup: Meetup): string {
  const when = meetup.frequency === 'once' ? formatLongDate(meetup.date) : `Every ${meetup['day-of-week']}`;
  return `${when}, ${formatTime(meetup['start-time'])} to ${formatTime(meetup['end-time'])}`;
}

export function renderVenue(location: MeetupLocation): string {
  const name = escapeHtml(location.name);
  return location.website ? `<a href="${escapeHtml(location.website)}">${name}</a>` : name;
}

function renderAddress(location: MeetupLocation): string {
  const venue = renderVenue(location);
  const street = location.suite ? `${location.street}, ${location.suite}` : location.street;
  const cityLine = `${location.city}, ${location.state} ${location.zip}`;
  return `<p>${venue}<br />${escapeHtml(street)}<br />${escapeHtml(cityLine)}</p>`;
}

function renderMap(image: MapImage, mapUrl: string | undefined): string {
  const img = `<img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}" width="320" height="240" loading="lazy" />`;
  const linkedImg = mapUrl ? `<a href="${escapeHtml(mapUrl)}">${img}</a>` : img;
  const caption = `&copy; <a href="${escapeHtml(image['attribution-url'])}">${escapeHtml(image.attribution)}</a>`;
  return `<figure class="map">${linkedImg}<figcaption>${caption}</figcaption></figure>`;
}

function renderNotes(notes: string[]): string {
  if (notes.length === 0) {
    return '';
  }
  return `<ul>${notes.map((note) => `<li>${escapeHtml(note)}</li>`).join('')}</ul>`;
}

/** A style attribute for the event's colors, or nothing when it has none. */
export function eventStyle(event: SpecialEvent): string {
  // The text color goes in a custom property so the stylesheet can apply it to headings and dates too.
  const declarations = [
    event['background-color'] && `background-color: ${event['background-color']}`,
    event['text-color'] && `--event-text: ${event['text-color']}`,
  ].filter(Boolean);
  return declarations.length > 0 ? ` style="${escapeHtml(declarations.join('; '))}"` : '';
}

function renderSpecialEvent(meetup: Meetup, event: SpecialEvent, dates: string[]): string {
  const image = event.image ? `<img src="${escapeHtml(event.image.src)}" alt="${escapeHtml(event.image.alt)}" loading="lazy" />` : '';
  return (
    `<div class="special-event" id="${escapeHtml(specialEventId(meetup, event))}"${eventStyle(event)}>` +
    image +
    `<h3>${escapeHtml(event.name)}</h3>` +
    `<p class="special-event-dates">${dates.map((date) => escapeHtml(formatShortDate(date))).join(' &middot; ')}</p>` +
    `<p>${escapeHtml(event.description)}</p>` +
    `</div>`
  );
}

function renderSpecialEvents(meetup: Meetup, events: SpecialEvent[], now: LocalDateTime): string {
  const upcoming = events.map((event) => ({ event, dates: remainingDates(event, meetup, now) })).filter(({ dates }) => dates.length > 0);
  if (upcoming.length === 0) {
    return '';
  }
  return `<h3>Upcoming special events</h3>${upcoming.map(({ event, dates }) => renderSpecialEvent(meetup, event, dates)).join('')}`;
}

/** The card shows the upcoming dates of each event that fall on this meetup; `events` may include others. */
export function renderMeetupCard(meetup: Meetup, events: SpecialEvent[], now: LocalDateTime): string {
  const { location } = meetup;
  const map = location['map-image'] ? renderMap(location['map-image'], location['map-url']) : '';
  return (
    `<section class="card" id="${escapeHtml(meetup.id)}">` +
    `<h2>${escapeHtml(meetup.title)}${renderTentativeStamp(meetup, now.date)}</h2>` +
    `<p><strong>${escapeHtml(describeSchedule(meetup))}</strong></p>` +
    `<div class="location">${renderAddress(location)}${map}</div>` +
    renderNotes(meetup.notes) +
    renderSpecialEvents(meetup, events, now) +
    `</section>`
  );
}

export function renderMeetups(data: MeetupsData, now: LocalDateTime): string {
  return data.meetups
    .filter((meetup) => !hasPassed(meetup, now))
    .map((meetup) => renderMeetupCard(meetup, data['special-events'], now))
    .join('');
}
