import type { Meetup } from './meetup';

export function aMeetup(overrides: Partial<Meetup> = {}): Meetup {
  return {
    id: 'weekly',
    title: 'Weekly in-person meetup',
    recurring: true,
    frequency: 'weekly',
    'day-of-week': 'Wednesday',
    'start-time': '17:30',
    'end-time': '22:00',
    location: {
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
    },
    notes: ['Bring a game.', 'Wear a name tag.'],
    ...overrides,
  };
}
