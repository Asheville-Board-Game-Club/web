/** @jest-environment jsdom */
import type { MeetupLocation } from './meetup';
import { describeSchedule, formatTime, renderMeetupCard, renderMeetups } from './render-meetups';
import { aMeetup } from './test-meetup';

function toElement(html: string): HTMLElement {
  const holder = document.createElement('div');
  holder.innerHTML = html;
  return holder;
}

function withLocation(changes: Partial<MeetupLocation>) {
  const meetup = aMeetup();
  return aMeetup({ location: { ...meetup.location, ...changes } });
}

describe('formatTime', () => {
  it.each([
    ['17:30', '5:30\u00a0PM'],
    ['09:05', '9:05\u00a0AM'],
    ['00:15', '12:15\u00a0AM'],
    ['12:00', '12:00\u00a0PM'],
  ])('formats %s as %s', (time, expected) => {
    expect(formatTime(time)).toBe(expected);
  });

  it.each(['5:30pm', '1730', ''])('rejects %j', (time) => {
    expect(() => formatTime(time)).toThrow(`Invalid time "${time}"`);
  });
});

describe('describeSchedule', () => {
  it('names the day and the start and end times', () => {
    const meetup = aMeetup({ 'day-of-week': 'Friday', 'start-time': '18:00', 'end-time': '21:45' });

    expect(describeSchedule(meetup)).toBe('Every Friday, 6:00\u00a0PM to 9:45\u00a0PM');
  });
});

describe('renderMeetupCard', () => {
  it('renders the title, id, and schedule', () => {
    const card = toElement(renderMeetupCard(aMeetup({ id: 'monthly', title: 'Monthly game day' })));

    expect(card.querySelector('section.card')?.id).toBe('monthly');
    expect(card.querySelector('h2')?.textContent).toBe('Monthly game day');
    expect(card.querySelector('p > strong')?.textContent).toBe('Every Wednesday, 5:30\u00a0PM to 10:00\u00a0PM');
  });

  it('links the venue name to its website and lists the full address', () => {
    const address = toElement(renderMeetupCard(aMeetup())).querySelector('.location > p');

    expect(address?.querySelector('a')?.getAttribute('href')).toBe('https://wellplayed.example/');
    expect(address?.innerHTML).toBe(
      '<a href="https://wellplayed.example/">Well Played Board Game Café</a><br>162 Coxe Ave, Suite 101<br>Asheville, NC 28801',
    );
  });

  it('shows the venue name without a link when there is no website', () => {
    const address = toElement(renderMeetupCard(withLocation({ website: undefined }))).querySelector('.location > p');

    expect(address?.querySelector('a')).toBeNull();
    expect(address?.innerHTML).toMatch(/^Well Played Board Game Café<br>/);
  });

  it('omits the suite when there is none', () => {
    const address = toElement(renderMeetupCard(withLocation({ suite: undefined }))).querySelector('.location > p');

    expect(address?.innerHTML).toContain('<br>162 Coxe Ave<br>');
  });

  it('renders the map image linked to the map URL, with attribution', () => {
    const map = toElement(renderMeetupCard(aMeetup())).querySelector('figure.map');

    const link = map?.querySelector('a:has(img)');
    expect(link?.getAttribute('href')).toBe('https://maps.example/well-played');
    expect(link?.querySelector('img')?.getAttribute('src')).toBe('/img/map.webp');
    expect(link?.querySelector('img')?.getAttribute('alt')).toBe('Map to the café');
    const credit = map?.querySelector('figcaption a');
    expect(credit?.getAttribute('href')).toBe('https://osm.example/copyright');
    expect(map?.querySelector('figcaption')?.textContent).toBe('© OpenStreetMap');
  });

  it('renders the map image without a link when there is no map URL', () => {
    const map = toElement(renderMeetupCard(withLocation({ 'map-url': undefined }))).querySelector('figure.map');

    expect(map?.querySelector('img')).not.toBeNull();
    expect(map?.querySelector('a:has(img)')).toBeNull();
  });

  it('omits the map when there is no map image', () => {
    const card = toElement(renderMeetupCard(withLocation({ 'map-image': undefined })));

    expect(card.querySelector('figure')).toBeNull();
  });

  it('lists the notes in order', () => {
    const items = toElement(renderMeetupCard(aMeetup())).querySelectorAll('ul > li');

    expect(Array.from(items, (item) => item.textContent)).toEqual(['Bring a game.', 'Wear a name tag.']);
  });

  it('omits the notes list when there are no notes', () => {
    expect(toElement(renderMeetupCard(aMeetup({ notes: [] }))).querySelector('ul')).toBeNull();
  });

  it('shows markup in the data as text', () => {
    const card = toElement(renderMeetupCard(aMeetup({ title: '<b>Games</b> & "fun"', notes: ["<script>alert('x')</script>"] })));

    expect(card.querySelector('h2')?.textContent).toBe('<b>Games</b> & "fun"');
    expect(card.querySelector('b, script')).toBeNull();
  });

  it('shows character references in the data literally', () => {
    const card = toElement(renderMeetupCard(aMeetup({ title: 'Rock &amp; Roll' })));

    expect(card.querySelector('h2')?.textContent).toBe('Rock &amp; Roll');
  });

  it('keeps double quotes in the data inside attribute values', () => {
    const meetup = withLocation({ website: 'https://wellplayed.example/?name="WP"' });

    const link = toElement(renderMeetupCard(meetup)).querySelector('.location > p > a');

    expect(link?.getAttribute('href')).toBe('https://wellplayed.example/?name="WP"');
  });
});

describe('renderMeetups', () => {
  it('renders one card per meetup, in order', () => {
    const cards = toElement(renderMeetups([aMeetup({ id: 'first' }), aMeetup({ id: 'second' })])).querySelectorAll('section.card');

    expect(Array.from(cards, (card) => card.id)).toEqual(['first', 'second']);
  });
});
