/** @jest-environment jsdom */
import type { MeetupLocation } from './meetup';
import type { LocalDateTime } from './asheville-clock';
import { describeSchedule, renderMeetupCard, renderMeetups } from './render-meetups';
import { aMeetup, aSpecialEvent } from './test-meetup';

const NOW: LocalDateTime = { date: '2026-10-07', minutesSinceMidnight: 12 * 60 };

function toElement(html: string): HTMLElement {
  const holder = document.createElement('div');
  holder.innerHTML = html;
  return holder;
}

function withLocation(changes: Partial<MeetupLocation>) {
  const meetup = aMeetup();
  return aMeetup({ location: { ...meetup.location, ...changes } });
}

describe('describeSchedule', () => {
  it('names the day and the start and end times', () => {
    const meetup = aMeetup({ 'day-of-week': 'Friday', 'start-time': '18:00', 'end-time': '21:45' });

    expect(describeSchedule(meetup)).toBe('Every Friday, 6:00\u00a0PM to 9:45\u00a0PM');
  });
});

describe('renderMeetupCard', () => {
  it('renders the title, id, and schedule', () => {
    const card = toElement(renderMeetupCard(aMeetup({ id: 'monthly', title: 'Monthly game day' }), NOW));

    expect(card.querySelector('section.card')?.id).toBe('monthly');
    expect(card.querySelector('h2')?.textContent).toBe('Monthly game day');
    expect(card.querySelector('p > strong')?.textContent).toBe('Every Wednesday, 5:30\u00a0PM to 10:00\u00a0PM');
  });

  it('links the venue name to its website and lists the full address', () => {
    const address = toElement(renderMeetupCard(aMeetup(), NOW)).querySelector('.location > p');

    expect(address?.querySelector('a')?.getAttribute('href')).toBe('https://wellplayed.example/');
    expect(address?.innerHTML).toBe(
      '<a href="https://wellplayed.example/">Well Played Board Game Café</a><br>162 Coxe Ave, Suite 101<br>Asheville, NC 28801',
    );
  });

  it('shows the venue name without a link when there is no website', () => {
    const address = toElement(renderMeetupCard(withLocation({ website: undefined }), NOW)).querySelector('.location > p');

    expect(address?.querySelector('a')).toBeNull();
    expect(address?.innerHTML).toMatch(/^Well Played Board Game Café<br>/);
  });

  it('omits the suite when there is none', () => {
    const address = toElement(renderMeetupCard(withLocation({ suite: undefined }), NOW)).querySelector('.location > p');

    expect(address?.innerHTML).toContain('<br>162 Coxe Ave<br>');
  });

  it('renders the map image linked to the map URL, with attribution', () => {
    const map = toElement(renderMeetupCard(aMeetup(), NOW)).querySelector('figure.map');

    const link = map?.querySelector('a:has(img)');
    expect(link?.getAttribute('href')).toBe('https://maps.example/well-played');
    expect(link?.querySelector('img')?.getAttribute('src')).toBe('/img/map.webp');
    expect(link?.querySelector('img')?.getAttribute('alt')).toBe('Map to the café');
    const credit = map?.querySelector('figcaption a');
    expect(credit?.getAttribute('href')).toBe('https://osm.example/copyright');
    expect(map?.querySelector('figcaption')?.textContent).toBe('© OpenStreetMap');
  });

  it('renders the map image without a link when there is no map URL', () => {
    const map = toElement(renderMeetupCard(withLocation({ 'map-url': undefined }), NOW)).querySelector('figure.map');

    expect(map?.querySelector('img')).not.toBeNull();
    expect(map?.querySelector('a:has(img)')).toBeNull();
  });

  it('omits the map when there is no map image', () => {
    const card = toElement(renderMeetupCard(withLocation({ 'map-image': undefined }), NOW));

    expect(card.querySelector('figure')).toBeNull();
  });

  it('lists the notes in order', () => {
    const items = toElement(renderMeetupCard(aMeetup(), NOW)).querySelectorAll('ul > li');

    expect(Array.from(items, (item) => item.textContent)).toEqual(['Bring a game.', 'Wear a name tag.']);
  });

  it('omits the notes list when there are no notes', () => {
    expect(toElement(renderMeetupCard(aMeetup({ notes: [] }), NOW)).querySelector('ul')).toBeNull();
  });

  it('shows markup in the data as text', () => {
    const card = toElement(renderMeetupCard(aMeetup({ title: '<b>Games</b> & "fun"', notes: ["<script>alert('x')</script>"] }), NOW));

    expect(card.querySelector('h2')?.textContent).toBe('<b>Games</b> & "fun"');
    expect(card.querySelector('b, script')).toBeNull();
  });

  it('shows character references in the data literally', () => {
    const card = toElement(renderMeetupCard(aMeetup({ title: 'Rock &amp; Roll' }), NOW));

    expect(card.querySelector('h2')?.textContent).toBe('Rock &amp; Roll');
  });

  it('keeps double quotes in the data inside attribute values', () => {
    const meetup = withLocation({ website: 'https://wellplayed.example/?name="WP"' });

    const link = toElement(renderMeetupCard(meetup, NOW)).querySelector('.location > p > a');

    expect(link?.getAttribute('href')).toBe('https://wellplayed.example/?name="WP"');
  });
});

describe('renderMeetupCard special events', () => {
  it('shows each upcoming event with its remaining dates, image, description, and colors', () => {
    const event = aSpecialEvent({
      name: 'Costumes',
      dates: ['2026-09-30', '2026-10-28', '2026-10-14'],
      description: 'Dress up.',
      image: { src: '/img/events/costumes.webp', alt: 'A witch hat' },
      'background-color': '#f4e1c1',
      'text-color': '#3a1f00',
    });

    const block = toElement(renderMeetupCard(aMeetup({ 'special-events': [event] }), NOW)).querySelector('.special-event');

    expect(block?.getAttribute('style')).toBe('background-color: #f4e1c1; --event-text: #3a1f00');
    expect(block?.id).toBe('weekly-costumes');
    expect(block?.firstElementChild?.tagName).toBe('IMG');
    expect(block?.querySelector('h3')?.textContent).toBe('Costumes');
    expect(block?.querySelector('.special-event-dates')?.textContent).toBe('Wed, Oct 14 · Wed, Oct 28');
    expect(block?.querySelector('img')?.getAttribute('src')).toBe('/img/events/costumes.webp');
    expect(block?.querySelector('img')?.getAttribute('alt')).toBe('A witch hat');
    expect(block?.querySelector('p:last-child')?.textContent).toBe('Dress up.');
  });

  it('shows an event without an image or colors', () => {
    const event = aSpecialEvent({ image: undefined, 'background-color': undefined, 'text-color': undefined });

    const block = toElement(renderMeetupCard(aMeetup({ 'special-events': [event] }), NOW)).querySelector('.special-event');

    expect(block?.querySelector('img')).toBeNull();
    expect(block?.hasAttribute('style')).toBe(false);
  });

  it('sets only the text color when the event has no background color', () => {
    const event = aSpecialEvent({ 'background-color': undefined, 'text-color': '#ffffff' });

    const block = toElement(renderMeetupCard(aMeetup({ 'special-events': [event] }), NOW)).querySelector('.special-event');

    expect(block?.getAttribute('style')).toBe('--event-text: #ffffff');
  });

  it('hides events whose dates have all passed', () => {
    const past = aSpecialEvent({ name: 'Past', dates: ['2026-09-30'] });
    const future = aSpecialEvent({ name: 'Future', dates: ['2026-10-14'] });

    const card = toElement(renderMeetupCard(aMeetup({ 'special-events': [past, future] }), NOW));

    expect(Array.from(card.querySelectorAll('.special-event h3'), (heading) => heading.textContent)).toEqual(['Future']);
  });

  it('omits the special events heading when none are upcoming', () => {
    const past = aSpecialEvent({ dates: ['2026-09-30'] });

    expect(toElement(renderMeetupCard(aMeetup({ 'special-events': [past] }), NOW)).querySelector('h3')).toBeNull();
    expect(toElement(renderMeetupCard(aMeetup(), NOW)).querySelector('h3')).toBeNull();
  });

  it('shows markup in event text as text', () => {
    const event = aSpecialEvent({ name: '<b>Costumes</b>', description: '<i>Dress up</i>' });

    expect(toElement(renderMeetupCard(aMeetup({ 'special-events': [event] }), NOW)).querySelector('b, i')).toBeNull();
  });
});

describe('renderMeetups', () => {
  it('renders one card per meetup, in order', () => {
    const cards = toElement(renderMeetups([aMeetup({ id: 'first' }), aMeetup({ id: 'second' })], NOW)).querySelectorAll('section.card');

    expect(Array.from(cards, (card) => card.id)).toEqual(['first', 'second']);
  });
});
