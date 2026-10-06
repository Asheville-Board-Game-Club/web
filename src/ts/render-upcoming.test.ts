/** @jest-environment jsdom */
import { NO_UPCOMING_HTML, renderUpcoming } from './render-upcoming';
import { aMeetup, aSpecialEvent } from './test-meetup';

function toElement(html: string): HTMLElement {
  const holder = document.createElement('div');
  holder.innerHTML = html;
  return holder;
}

describe('renderUpcoming', () => {
  const meetup = aMeetup({ id: 'weekly', title: 'Weekly meetup', 'start-time': '17:30', 'end-time': '22:00' });

  it('lists each occurrence with its date, times, meetup link, and venue', () => {
    const items = toElement(renderUpcoming([{ meetup, date: '2026-10-14', events: [] }], '2026-10-07')).querySelectorAll('ul.upcoming > li');

    expect(items).toHaveLength(1);
    expect(items[0]?.querySelector('.upcoming-when')?.textContent).toBe('Wed, Oct 14');
    expect(items[0]?.querySelector('.upcoming-time')?.textContent).toBe('5:30\u00a0PM – 10:00\u00a0PM');
    const links = items[0]?.querySelectorAll('a');
    expect(links?.[0]?.getAttribute('href')).toBe('/meetups/#weekly');
    expect(links?.[0]?.textContent).toBe('Weekly meetup');
    expect(links?.[1]?.getAttribute('href')).toBe('https://wellplayed.example/');
    expect(links?.[1]?.textContent).toBe('Well Played Board Game Café');
  });

  it("labels today's occurrence", () => {
    const html = renderUpcoming([{ meetup, date: '2026-10-07', events: [] }], '2026-10-07');

    expect(toElement(html).querySelector('.upcoming-when')?.textContent).toBe('Today (Wed, Oct 7)');
  });

  it('keeps the order it is given', () => {
    const html = renderUpcoming(
      [
        { meetup, date: '2026-10-07', events: [] },
        { meetup, date: '2026-10-14', events: [] },
      ],
      '2026-10-07',
    );

    const dates = Array.from(toElement(html).querySelectorAll('.upcoming-when'), (when) => when.textContent);
    expect(dates).toEqual(['Today (Wed, Oct 7)', 'Wed, Oct 14']);
  });

  it('shows markup in the meetup title as text', () => {
    const html = renderUpcoming([{ meetup: aMeetup({ title: '<b>Games</b>' }), date: '2026-10-14', events: [] }], '2026-10-07');

    expect(toElement(html).querySelector('b')).toBeNull();
  });

  it('lists each special event under its occurrence, in its colors', () => {
    const events = [
      aSpecialEvent({ name: 'Costumes', image: undefined, 'background-color': '#f4e1c1', 'text-color': '#3a1f00' }),
      aSpecialEvent({ name: 'Auction', image: undefined, 'background-color': undefined, 'text-color': undefined }),
    ];

    const items = toElement(renderUpcoming([{ meetup, date: '2026-10-28', events }], '2026-10-07')).querySelectorAll(
      'li ul.upcoming-events > li',
    );

    expect(Array.from(items, (item) => item.textContent)).toEqual(['★ Costumes', '★ Auction']);
    expect(items[0]?.getAttribute('style')).toBe('background-color: #f4e1c1; --event-text: #3a1f00');
    expect(items[1]?.hasAttribute('style')).toBe(false);
  });

  it('links each special event to its block on the Meetups page', () => {
    const events = [aSpecialEvent({ name: 'Costume Contest' })];

    const link = toElement(renderUpcoming([{ meetup, date: '2026-10-28', events }], '2026-10-07')).querySelector('.upcoming-events a');

    expect(link?.getAttribute('href')).toBe('/meetups/#weekly-costume-contest');
    expect(link?.textContent).toContain('Costume Contest');
  });

  it("shows the event's image after its name, in place of the star", () => {
    const events = [aSpecialEvent({ name: 'Costumes', image: { src: '/img/events/witch.webp', alt: 'A witch' } })];

    const link = toElement(renderUpcoming([{ meetup, date: '2026-10-28', events }], '2026-10-07')).querySelector('.upcoming-events a');

    expect(link?.textContent).toBe('Costumes ');
    expect(link?.lastElementChild?.getAttribute('src')).toBe('/img/events/witch.webp');
    expect(link?.lastElementChild?.getAttribute('alt')).toBe('');
  });

  it('omits the events list when an occurrence has none', () => {
    expect(toElement(renderUpcoming([{ meetup, date: '2026-10-14', events: [] }], '2026-10-07')).querySelector('.upcoming-events')).toBeNull();
  });

  it('shows markup in an event name as text', () => {
    const events = [aSpecialEvent({ name: '<b>Costumes</b>' })];

    expect(toElement(renderUpcoming([{ meetup, date: '2026-10-28', events }], '2026-10-07')).querySelector('b')).toBeNull();
  });

  it('says so when nothing is coming up', () => {
    expect(renderUpcoming([], '2026-10-07')).toBe(NO_UPCOMING_HTML);
    expect(NO_UPCOMING_HTML).toContain('next 30 days');
  });
});
