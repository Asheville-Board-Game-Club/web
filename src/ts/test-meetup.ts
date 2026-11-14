import type { Meetup, MeetupLocation, MeetupsData, OnceMeetup, SpecialEvent, WeeklyMeetup } from './meetup';

const LOCATION: MeetupLocation = {
  name: 'Well Played Board Game Café',
  website: 'https://wellplayed.example/',
  street: '162 Coxe Ave',
  suite: 'Suite 101',
  city: 'Asheville',
  state: 'NC',
  zip: '28801',
  'map-url': 'https://maps.example/well-played',
  'map-image': {
    src: '/img/map.webp',
    alt: 'Map to the café',
    attribution: 'OpenStreetMap',
    'attribution-url': 'https://osm.example/copyright',
  },
};

export function aMeetup(overrides: Partial<WeeklyMeetup> = {}): WeeklyMeetup {
  return {
    id: 'weekly',
    title: 'Weekly in-person meetup',
    frequency: 'weekly',
    'day-of-week': 'Wednesday',
    'start-time': '17:30',
    'end-time': '22:00',
    location: LOCATION,
    notes: ['Bring a game.', 'Wear a name tag.'],
    ...overrides,
  };
}

/** A Saturday, so it never shares a date with aMeetup's default Wednesdays. */
export function aOnceMeetup(overrides: Partial<OnceMeetup> = {}): OnceMeetup {
  return {
    id: 'game-day',
    title: 'Holiday game day',
    frequency: 'once',
    date: '2026-12-12',
    'start-time': '13:00',
    'end-time': '18:00',
    location: LOCATION,
    notes: ['Snacks provided.'],
    ...overrides,
  };
}

/** Dates are Wednesdays, to match aMeetup's default day. */
export function aSpecialEvent(overrides: Partial<SpecialEvent> = {}): SpecialEvent {
  return {
    name: 'Halloween Game Night',
    dates: ['2026-10-28'],
    description: 'Costumes welcome.',
    image: { src: '/img/events/halloween.webp', alt: 'Jack-o-lanterns around a game board' },
    'background-color': '#f4e1c1',
    'text-color': '#3a1f00',
    ...overrides,
  };
}

export function aMeetupsData(meetups: Meetup[], events: SpecialEvent[] = []): MeetupsData {
  return { meetups, 'special-events': events };
}
