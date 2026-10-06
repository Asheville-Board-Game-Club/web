import type { Meetup, SpecialEvent } from './meetup';

/** The HTML id of the event's block on the Meetups page, e.g. "weekly-halloween-party"; Home links to it. */
export function specialEventId(meetup: Meetup, event: SpecialEvent): string {
  const slug = event.name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${meetup.id}-${slug}`;
}
