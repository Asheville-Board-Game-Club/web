// AIDEV-NOTE: Mirrors src/data/meetups.json, which the browser fetches; keys keep the JSON's kebab-case.
export type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface MapImage {
  src: string;
  alt: string;
  attribution: string;
  'attribution-url': string;
}

export interface MeetupLocation {
  name: string;
  website?: string;
  street: string;
  suite?: string;
  city: string;
  state: string;
  zip: string;
  'map-url'?: string;
  'map-image'?: MapImage;
}

export interface EventImage {
  src: string;
  alt: string;
}

export interface SpecialEvent {
  name: string;
  /** "YYYY-MM-DD"; each must fall on the meetup's day of the week. */
  dates: string[];
  description: string;
  image?: EventImage;
  /** "#rrggbb" */
  'background-color'?: string;
  /** "#rrggbb"; used for all of the event's text. */
  'text-color'?: string;
}

export interface Meetup {
  id: string;
  title: string;
  recurring: boolean;
  // AIDEV-NOTE: Only weekly meetups exist so far; widen this union (and describeSchedule) when that changes.
  frequency: 'weekly';
  'day-of-week': DayOfWeek;
  /** 24-hour "HH:MM" */
  'start-time': string;
  /** 24-hour "HH:MM" */
  'end-time': string;
  location: MeetupLocation;
  notes: string[];
  'special-events'?: SpecialEvent[];
}
