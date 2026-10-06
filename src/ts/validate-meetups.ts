import { DAYS_OF_WEEK } from './calendar-date';
import type { Meetup } from './meetup';
import { minutesSinceMidnight } from './time-of-day';

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
const boolean = rule((value) => typeof value === 'boolean', 'must be true or false');
// The id becomes an HTML id and a link anchor (/meetups/#id).
const id = rule((value) => typeof value === 'string' && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value), 'must be lowercase letters, digits, and dashes');

function oneOf(allowed: readonly string[]): Check {
  return rule((value) => typeof value === 'string' && allowed.includes(value), `must be one of: ${allowed.join(', ')}`);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function object(required: Record<string, Check>, optional: Record<string, Check> = {}): Check {
  return (value, path) => {
    if (!isPlainObject(value)) {
      return [`${path} must be an object`];
    }
    const known = { ...required, ...optional };
    const unknownFields = Object.keys(value)
      .filter((key) => !(key in known))
      .map((key) => `${path}.${key} is not a known field`);
    const missingFields = Object.keys(required)
      .filter((key) => !(key in value))
      .map((key) => `${path}.${key} is required`);
    const fieldProblems = Object.entries(known)
      .filter(([key]) => key in value)
      .flatMap(([key, check]) => check(value[key], `${path}.${key}`));
    return [...unknownFields, ...missingFields, ...fieldProblems];
  };
}

function arrayOf(item: Check): Check {
  return (value, path) =>
    Array.isArray(value) ? value.flatMap((element, index) => item(element, `${path}[${index}]`)) : [`${path} must be a list`];
}

const mapImage = object({ src: sitePath, alt: text, attribution: text, 'attribution-url': webUrl });

const location = object(
  { name: text, street: text, city: text, state: text, zip: text },
  { website: webUrl, suite: text, 'map-url': webUrl, 'map-image': mapImage },
);

const meetup = object({
  id,
  title: text,
  recurring: boolean,
  frequency: oneOf(['weekly']),
  'day-of-week': oneOf(DAYS_OF_WEEK),
  'start-time': time,
  'end-time': time,
  location,
  notes: arrayOf(text),
});

function crossFieldProblems(meetups: Meetup[]): string[] {
  const problems: string[] = [];
  const seenIds = new Set<string>();
  meetups.forEach((entry, index) => {
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

/** Every problem found in the meetups data; empty when it is valid. */
export function validateMeetups(data: unknown): string[] {
  const structural = arrayOf(meetup)(data, 'meetups');
  // Cross-field checks rely on the shape being right, so they only run once it is.
  return structural.length > 0 ? structural : crossFieldProblems(data as Meetup[]);
}
