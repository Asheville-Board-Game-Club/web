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
  /** "YYYY-MM-DD"; each must be a date exactly one meetup occurs on, which is where the event shows. */
  dates: string[];
  description: string;
  image?: EventImage;
  /** "#rrggbb" */
  'background-color'?: string;
  /** "#rrggbb"; used for all of the event's text. */
  'text-color'?: string;
}

interface MeetupDetails {
  id: string;
  title: string;
  /** 24-hour "HH:MM" */
  'start-time': string;
  /** 24-hour "HH:MM" */
  'end-time': string;
  location: MeetupLocation;
  notes: string[];
  /** "YYYY-MM-DD"; the meetup is marked tentative on days before this one. */
  'tentative-until'?: string;
}

export interface WeeklyMeetup extends MeetupDetails {
  frequency: 'weekly';
  'day-of-week': DayOfWeek;
}

export interface OnceMeetup extends MeetupDetails {
  frequency: 'once';
  /** "YYYY-MM-DD" */
  date: string;
}

// AIDEV-NOTE: A new schedule kind also needs occursOn, hasPassed, describeSchedule, and the validator updated.
export type Meetup = WeeklyMeetup | OnceMeetup;

export interface MeetupsData {
  meetups: Meetup[];
  'special-events': SpecialEvent[];
}
