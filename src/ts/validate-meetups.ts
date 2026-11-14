import { DAYS_OF_WEEK } from './calendar-date';
import type { MeetupsData } from './meetup';
import { specialEventSlug } from './special-event-id';
import { minutesSinceMidnight } from './time-of-day';
import { occursOn } from './upcoming-meetups';

// AIDEV-NOTE: Run against src/data/meetups.json by meetups-data.test.ts, which `yarn build` runs before Eleventy,
// so a bad hand edit fails the Cloudflare deploy. Keep these rules in step with meetup.ts.

/** Returns a description of each problem found at `path`; empty when the value is acceptable. */
type Check = (value: unknown, path: string) => string[];

function rule(isValid: (value: unknown) => boolean, problem: string): Check {
  return (value, path) => (isValid(value) ? [] : [`${path} ${problem}`]);
}

const text = rule((value) => typeof value === 'string' && value.trim() !== '', 'must be non-empty text');
const webUrl = rule((value) => typeof value === 'string' && /^https?:\/\/\S+$/.test(value), 'must be an http:// or https:// URL');
const sitePath = rule((value) => typeof value === 'string' && /^\/\S+$/.test(value), 'must be a site path starting with /');
const time = rule((value) => typeof value === 'string' && /^([01]?\d|2[0-3]):[0-5]\d$/.test(value), 'must be a 24-hour time like "17:30"');
// The id becomes an HTML id and a link anchor (/meetups/#id).
const id = rule((value) => typeof value === 'string' && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value), 'must be lowercase letters, digits, and dashes');

// Round-tripping rejects other formats, and dates like 2026-02-30 that Date would roll over to March.
function isRealDate(value: string): boolean {
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

const calendarDate = rule((value) => typeof value === 'string' && isRealDate(value), 'must be a real date like "2026-10-28"');
const hexColor = rule((value) => typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value), 'must be a hex color like "#f4e1c1"');

function oneOf(allowed: readonly string[]): Check {
  return rule((value) => typeof value === 'string' && allowed.includes(value), `must be one of: ${allowed.join(', ')}`);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function fieldPath(path: string, key: string): string {
  return path === '' ? key : `${path}.${key}`;
}

function object(required: Record<string, Check>, optional: Record<string, Check> = {}): Check {
  return (value, path) => {
    if (!isPlainObject(value)) {
      return [`${path} must be an object`];
    }
    const known = { ...required, ...optional };
    const unknownFields = Object.keys(value)
      .filter((key) => !(key in known))
      .map((key) => `${fieldPath(path, key)} is not a known field`);
    const missingFields = Object.keys(required)
      .filter((key) => !(key in value))
      .map((key) => `${fieldPath(path, key)} is required`);
    const fieldProblems = Object.entries(known)
      .filter(([key]) => key in value)
      .flatMap(([key, check]) => check(value[key], fieldPath(path, key)));
    return [...unknownFields, ...missingFields, ...fieldProblems];
  };
}

function arrayOf(item: Check): Check {
  return (value, path) =>
    Array.isArray(value) ? value.flatMap((element, index) => item(element, `${path}[${index}]`)) : [`${path} must be a list`];
}

function nonEmpty(check: Check): Check {
  return (value, path) => (Array.isArray(value) && value.length === 0 ? [`${path} must not be empty`] : check(value, path));
}

const mapImage = object({ src: sitePath, alt: text, attribution: text, 'attribution-url': webUrl });

const location = object(
  { name: text, street: text, city: text, state: text, zip: text },
  { website: webUrl, suite: text, 'map-url': webUrl, 'map-image': mapImage },
);

const specialEvent = object(
  { name: text, dates: nonEmpty(arrayOf(calendarDate)), description: text },
  { image: object({ src: sitePath, alt: text }), 'background-color': hexColor, 'text-color': hexColor },
);

const FREQUENCIES = ['weekly', 'once'];

const meetupDetails = {
  id,
  title: text,
  frequency: oneOf(FREQUENCIES),
  'start-time': time,
  'end-time': time,
  location,
  notes: arrayOf(text),
};

const optionalMeetupDetails = { 'tentative-until': calendarDate };

const weeklyMeetup = object({ ...meetupDetails, 'day-of-week': oneOf(DAYS_OF_WEEK) }, optionalMeetupDetails);
const onceMeetup = object({ ...meetupDetails, date: calendarDate }, optionalMeetupDetails);

// The frequency picks which fields the rest of the meetup needs; anything but "once" is checked as weekly.
const meetup: Check = (value, path) => (isPlainObject(value) && value.frequency === 'once' ? onceMeetup : weeklyMeetup)(value, path);

const meetupsData = object({ meetups: arrayOf(meetup), 'special-events': arrayOf(specialEvent) });

function meetupProblems(data: MeetupsData): string[] {
  const problems: string[] = [];
  const seenIds = new Set<string>();
  data.meetups.forEach((entry, index) => {
    if (seenIds.has(entry.id)) {
      problems.push(`meetups[${index}].id "${entry.id}" is used by more than one meetup`);
    }
    seenIds.add(entry.id);
    if (minutesSinceMidnight(entry['end-time']) <= minutesSinceMidnight(entry['start-time'])) {
      problems.push(`meetups[${index}].end-time must be after start-time (meetups can't run past midnight)`);
    }
  });
  return problems;
}

// AIDEV-NOTE: Events attach to meetups by date, so each date must pick out exactly one meetup.
function specialEventProblems(data: MeetupsData): string[] {
  const problems: string[] = [];
  const seenSlugs = new Set<string>();
  data['special-events'].forEach((event, index) => {
    const slug = specialEventSlug(event);
    if (seenSlugs.has(slug)) {
      problems.push(`special-events[${index}].name gives the same link (${slug}) as another special event`);
    }
    seenSlugs.add(slug);
    event.dates.forEach((date) => {
      const meetupCount = data.meetups.filter((entry) => occursOn(entry, date)).length;
      if (meetupCount === 0) {
        problems.push(`special-events[${index}].dates has ${date}, when no meetup occurs`);
      } else if (meetupCount > 1) {
        problems.push(`special-events[${index}].dates has ${date}, when more than one meetup occurs`);
      }
    });
  });
  return problems;
}

/** Every problem found in the meetups data; empty when it is valid. */
export function validateMeetups(data: unknown): string[] {
  if (!isPlainObject(data)) {
    return ['The data must be an object with "meetups" and "special-events"'];
  }
  const structural = meetupsData(data, '');
  // Cross-field checks rely on the shape being right, so they only run once it is.
  if (structural.length > 0) {
    return structural;
  }
  const valid = data as unknown as MeetupsData;
  return [...meetupProblems(valid), ...specialEventProblems(valid)];
}
