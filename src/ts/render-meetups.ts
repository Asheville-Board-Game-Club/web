import type { MapImage, Meetup, MeetupLocation } from './meetup';
import { formatTime } from './time-of-day';

// Enough for element text and double-quoted attributes, which is all this file produces.
const HTML_ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '"': '&quot;' };

// The JSON is edited by hand, so treat every value as text rather than markup.
export function escapeHtml(text: string): string {
  return text.replace(/[&<"]/g, (character) => HTML_ESCAPES[character] ?? character);
}

export function describeSchedule(meetup: Meetup): string {
  return `Every ${meetup['day-of-week']}, ${formatTime(meetup['start-time'])} to ${formatTime(meetup['end-time'])}`;
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

export function renderMeetupCard(meetup: Meetup): string {
  const { location } = meetup;
  const map = location['map-image'] ? renderMap(location['map-image'], location['map-url']) : '';
  return (
    `<section class="card" id="${escapeHtml(meetup.id)}">` +
    `<h2>${escapeHtml(meetup.title)}</h2>` +
    `<p><strong>${escapeHtml(describeSchedule(meetup))}</strong></p>` +
    `<div class="location">${renderAddress(location)}${map}</div>` +
    renderNotes(meetup.notes) +
    `</section>`
  );
}

export function renderMeetups(meetups: Meetup[]): string {
  return meetups.map(renderMeetupCard).join('');
}
