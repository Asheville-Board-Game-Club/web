import type { Meetup, SpecialEvent } from './meetup';

/** The link-safe form of the event's name, e.g. "halloween-party". */
export function specialEventSlug(event: SpecialEvent): string {
  return event.name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** The HTML id of the event's block in a meetup's card on the Meetups page, e.g. "weekly-halloween-party". */
export function specialEventId(meetup: Meetup, event: SpecialEvent): string {
  return `${meetup.id}-${specialEventSlug(event)}`;
}
