import type { Meetup } from './meetup';
import { aMeetup, aOnceMeetup, aSpecialEvent } from './test-meetup';
import { validateMeetups } from './validate-meetups';

function withField(field: string, value: unknown): Record<string, unknown> {
  return { ...aMeetup(), [field]: value };
}

function withLocationField(field: string, value: unknown): Record<string, unknown> {
  const meetup = aMeetup();
  return { ...meetup, location: { ...meetup.location, [field]: value } };
}

function withMapImageField(field: string, value: unknown): Record<string, unknown> {
  const meetup = aMeetup();
  return withLocationField('map-image', { ...meetup.location['map-image'], [field]: value });
}

function withEventField(field: string, value: unknown): Record<string, unknown> {
  return { ...aSpecialEvent(), [field]: value };
}

function dataWith(meetups: unknown[], events: unknown[] = []): Record<string, unknown> {
  return { meetups, 'special-events': events };
}

function without(meetup: Meetup, field: keyof Meetup): Record<string, unknown> {
  return Object.fromEntries(Object.entries(meetup).filter(([key]) => key !== field));
}

describe('validateMeetups', () => {
  it('accepts valid meetups', () => {
    expect(validateMeetups(dataWith([aMeetup({ id: 'weekly' }), aOnceMeetup({ id: 'game-day' })]))).toEqual([]);
  });

  it('accepts a location without its optional fields', () => {
    const meetup = aMeetup();
    const { name, street, city, state, zip } = meetup.location;

    expect(validateMeetups(dataWith([{ ...meetup, location: { name, street, city, state, zip } }]))).toEqual([]);
  });

  it('accepts empty lists', () => {
    expect(validateMeetups(dataWith([]))).toEqual([]);
  });

  it('requires an object', () => {
    expect(validateMeetups([])).toEqual(['The data must be an object with "meetups" and "special-events"']);
  });

  it('requires the meetups and special events lists', () => {
    expect(validateMeetups({})).toEqual(['meetups is required', 'special-events is required']);
    expect(validateMeetups({ meetups: {}, 'special-events': 'none' })).toEqual(['meetups must be a list', 'special-events must be a list']);
  });

  it('reports unknown top-level fields', () => {
    expect(validateMeetups({ ...dataWith([]), events: [] })).toEqual(['events is not a known field']);
  });

  it('requires each meetup to be an object', () => {
    expect(validateMeetups(dataWith(['weekly']))).toEqual(['meetups[0] must be an object']);
  });

  it('reports missing required fields', () => {
    expect(validateMeetups(dataWith([without(aMeetup(), 'title')]))).toEqual(['meetups[0].title is required']);
    expect(validateMeetups(dataWith([without(aMeetup(), 'location')]))).toEqual(['meetups[0].location is required']);
  });

  it('reports misspelled or unknown fields', () => {
    expect(validateMeetups(dataWith([{ ...aMeetup(), start_time: '17:30' }]))).toEqual(['meetups[0].start_time is not a known field']);
  });

  it('reports misspelled or unknown location fields', () => {
    expect(validateMeetups(dataWith([withLocationField('adress', '162 Coxe Ave')]))).toEqual([
      'meetups[0].location.adress is not a known field',
    ]);
  });

  it.each([
    ['id', 'Weekly Meetup', 'must be lowercase letters, digits, and dashes'],
    ['id', 'weekly-', 'must be lowercase letters, digits, and dashes'],
    ['id', 'Weekly', 'must be lowercase letters, digits, and dashes'],
    ['title', '  ', 'must be non-empty text'],
    ['frequency', 'monthly', 'must be one of: weekly, once'],
    ['day-of-week', 'wednesday', 'must be one of: Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday'],
    ['start-time', '5:30pm', 'must be a 24-hour time like "17:30"'],
    ['end-time', '24:00', 'must be a 24-hour time like "17:30"'],
    ['end-time', '22:60', 'must be a 24-hour time like "17:30"'],
    ['location', 'Well Played', 'must be an object'],
    ['location', null, 'must be an object'],
    ['location', [], 'must be an object'],
    ['notes', 'Bring a game.', 'must be a list'],
  ])('rejects %s of %j', (field, value, problem) => {
    expect(validateMeetups(dataWith([withField(field, value)]))).toEqual([`meetups[0].${field} ${problem}`]);
  });

  it('checks a one-off meetup for a date instead of a day of the week', () => {
    expect(validateMeetups(dataWith([{ ...aMeetup(), frequency: 'once' }]))).toEqual([
      'meetups[0].day-of-week is not a known field',
      'meetups[0].date is required',
    ]);
  });

  it.each(['12/12/2026', '2026-12-32'])('rejects the one-off meetup date %j', (date) => {
    expect(validateMeetups(dataWith([aOnceMeetup({ date })]))).toEqual(['meetups[0].date must be a real date like "2026-10-28"']);
  });

  it('accepts single-digit hours and the ends of the day', () => {
    expect(validateMeetups(dataWith([aMeetup({ 'start-time': '0:00', 'end-time': '23:59' })]))).toEqual([]);
  });

  it('rejects notes that are not text', () => {
    expect(validateMeetups(dataWith([withField('notes', ['Bring a game.', 42])]))).toEqual(['meetups[0].notes[1] must be non-empty text']);
  });

  it.each([
    ['name', '', 'must be non-empty text'],
    ['zip', 28801, 'must be non-empty text'],
    ['website', 'wellplayedasheville.com', 'must be an http:// or https:// URL'],
    ['website', 'https://', 'must be an http:// or https:// URL'],
    ['map-url', 'javascript:alert(1)', 'must be an http:// or https:// URL'],
    ['suite', '', 'must be non-empty text'],
    ['map-image', '/img/map.webp', 'must be an object'],
  ])('rejects location %s of %j', (field, value, problem) => {
    expect(validateMeetups(dataWith([withLocationField(field, value)]))).toEqual([`meetups[0].location.${field} ${problem}`]);
  });

  it.each([
    ['src', 'img/map.webp', 'must be a site path starting with /'],
    ['alt', '', 'must be non-empty text'],
    ['attribution', '', 'must be non-empty text'],
    ['attribution-url', 'openstreetmap.org/copyright', 'must be an http:// or https:// URL'],
  ])('rejects map image %s of %j', (field, value, problem) => {
    expect(validateMeetups(dataWith([withMapImageField(field, value)]))).toEqual([`meetups[0].location.map-image.${field} ${problem}`]);
  });

  it('reports every problem, with the position of each meetup', () => {
    expect(validateMeetups(dataWith([aMeetup(), withField('title', ''), withLocationField('city', '')]))).toEqual([
      'meetups[1].title must be non-empty text',
      'meetups[2].location.city must be non-empty text',
    ]);
  });

  it('rejects ids used more than once', () => {
    expect(validateMeetups(dataWith([aMeetup({ id: 'weekly' }), aMeetup({ id: 'other' }), aMeetup({ id: 'weekly' })]))).toEqual([
      'meetups[2].id "weekly" is used by more than one meetup',
    ]);
  });

  it.each([
    ['22:00', '17:30'],
    ['17:30', '17:30'],
  ])('rejects a start time of %s with an end time of %s', (start, end) => {
    expect(validateMeetups(dataWith([aMeetup({ 'start-time': start, 'end-time': end })]))).toEqual([
      "meetups[0].end-time must be after start-time (meetups can't run past midnight)",
    ]);
  });

  it('accepts special events, with or without their optional fields', () => {
    const { dates, description } = aSpecialEvent();
    const plain = { name: 'Plain event', dates, description };

    expect(validateMeetups(dataWith([aMeetup()], [aSpecialEvent(), plain]))).toEqual([]);
  });

  it.each([
    ['name', '', 'must be non-empty text'],
    ['description', '', 'must be non-empty text'],
    ['dates', '2026-10-28', 'must be a list'],
    ['dates', [], 'must not be empty'],
    ['background-color', 'orange', 'must be a hex color like "#f4e1c1"'],
    ['background-color', '#fff', 'must be a hex color like "#f4e1c1"'],
    ['text-color', 'black', 'must be a hex color like "#f4e1c1"'],
    ['image', '/img/events/halloween.webp', 'must be an object'],
    ['colour', '#f4e1c1', 'is not a known field'],
  ])('rejects special event %s of %j', (field, value, problem) => {
    expect(validateMeetups(dataWith([aMeetup()], [withEventField(field, value)]))).toEqual([`special-events[0].${field} ${problem}`]);
  });

  it.each(['10/28/2026', '2026-10-28T17:30', '2026-02-30', '2026-13-01'])('rejects the special event date %j', (date) => {
    expect(validateMeetups(dataWith([aMeetup()], [withEventField('dates', [date])]))).toEqual([
      'special-events[0].dates[0] must be a real date like "2026-10-28"',
    ]);
  });

  it('rejects special event images without a site path or alt text', () => {
    expect(validateMeetups(dataWith([aMeetup()], [withEventField('image', { src: 'halloween.webp', alt: '' })]))).toEqual([
      'special-events[0].image.src must be a site path starting with /',
      'special-events[0].image.alt must be non-empty text',
    ]);
  });

  it('rejects special event dates when no meetup occurs', () => {
    const event = aSpecialEvent({ dates: ['2026-10-28', '2026-10-31'] });

    expect(validateMeetups(dataWith([aMeetup({ 'day-of-week': 'Wednesday' })], [event]))).toEqual([
      'special-events[0].dates has 2026-10-31, when no meetup occurs',
    ]);
  });

  it('accepts special event dates spread across different meetups', () => {
    const meetups = [aMeetup({ id: 'wednesday', 'day-of-week': 'Wednesday' }), aMeetup({ id: 'saturday', 'day-of-week': 'Saturday' })];

    expect(validateMeetups(dataWith(meetups, [aSpecialEvent({ dates: ['2026-10-28', '2026-10-31'] })]))).toEqual([]);
  });

  it('rejects special event dates when more than one meetup occurs', () => {
    const meetups = [aMeetup({ id: 'evening', 'day-of-week': 'Wednesday' }), aMeetup({ id: 'morning', 'day-of-week': 'Wednesday' })];

    expect(validateMeetups(dataWith(meetups, [aSpecialEvent({ dates: ['2026-10-28'] })]))).toEqual([
      'special-events[0].dates has 2026-10-28, when more than one meetup occurs',
    ]);
  });

  it('rejects special events whose names would give the same link', () => {
    const events = [aSpecialEvent({ name: 'Game Swap' }), aSpecialEvent({ name: 'Game swap!' })];

    expect(validateMeetups(dataWith([aMeetup()], events))).toEqual([
      'special-events[1].name gives the same link (game-swap) as another special event',
    ]);
  });
});
