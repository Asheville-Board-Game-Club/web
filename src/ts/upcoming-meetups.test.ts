import type { LocalDateTime } from './asheville-clock';
import { aMeetup, aSpecialEvent } from './test-meetup';
import { remainingDates, upcomingOccurrences, type MeetupOccurrence } from './upcoming-meetups';

const WEDNESDAY_NOON: LocalDateTime = { date: '2026-10-07', minutesSinceMidnight: 12 * 60 };

function summarize(occurrences: MeetupOccurrence[]): string[] {
  return occurrences.map(({ meetup, date }) => `${date} ${meetup.id}`);
}

describe('upcomingOccurrences', () => {
  const weekly = aMeetup({ id: 'weekly', 'day-of-week': 'Wednesday', 'start-time': '17:30', 'end-time': '22:00' });

  it('lists a weekly meetup on each matching day within the window, starting today', () => {
    expect(summarize(upcomingOccurrences([weekly], WEDNESDAY_NOON, 30))).toEqual([
      '2026-10-07 weekly',
      '2026-10-14 weekly',
      '2026-10-21 weekly',
      '2026-10-28 weekly',
      '2026-11-04 weekly',
    ]);
  });

  it('ends the window the day before today plus the number of days', () => {
    expect(summarize(upcomingOccurrences([weekly], WEDNESDAY_NOON, 7))).toEqual(['2026-10-07 weekly']);
    expect(summarize(upcomingOccurrences([weekly], WEDNESDAY_NOON, 8))).toEqual(['2026-10-07 weekly', '2026-10-14 weekly']);
  });

  it("keeps today's meetup until its end time", () => {
    const now: LocalDateTime = { date: '2026-10-07', minutesSinceMidnight: 21 * 60 + 59 };

    expect(summarize(upcomingOccurrences([weekly], now, 8))[0]).toBe('2026-10-07 weekly');
  });

  it("drops today's meetup once its end time arrives", () => {
    const now: LocalDateTime = { date: '2026-10-07', minutesSinceMidnight: 22 * 60 };

    expect(summarize(upcomingOccurrences([weekly], now, 8))).toEqual(['2026-10-14 weekly']);
  });

  it('only drops meetups that are today', () => {
    const saturday = aMeetup({ id: 'saturday', 'day-of-week': 'Saturday', 'end-time': '11:00' });

    expect(summarize(upcomingOccurrences([saturday], WEDNESDAY_NOON, 7))).toEqual(['2026-10-10 saturday']);
  });

  it('orders meetups from several schedules by date, then start time', () => {
    const evening = aMeetup({ id: 'evening', 'day-of-week': 'Saturday', 'start-time': '18:00', 'end-time': '21:00' });
    const morning = aMeetup({ id: 'morning', 'day-of-week': 'Saturday', 'start-time': '9:00', 'end-time': '12:00' });

    expect(summarize(upcomingOccurrences([evening, weekly, morning], WEDNESDAY_NOON, 8))).toEqual([
      '2026-10-07 weekly',
      '2026-10-10 morning',
      '2026-10-10 evening',
      '2026-10-14 weekly',
    ]);
  });

  it('returns nothing when no meetup falls in the window', () => {
    const friday = aMeetup({ 'day-of-week': 'Friday' });

    expect(upcomingOccurrences([friday], WEDNESDAY_NOON, 2)).toEqual([]);
  });

  it('attaches the special events on each date, and none to other dates', () => {
    const costumes = aSpecialEvent({ name: 'Costumes', dates: ['2026-10-14', '2026-10-28'] });
    const auction = aSpecialEvent({ name: 'Auction', dates: ['2026-10-28'] });
    const meetup = aMeetup({ 'special-events': [costumes, auction] });

    const occurrences = upcomingOccurrences([meetup], WEDNESDAY_NOON, 22);

    expect(occurrences.map(({ date, events }) => `${date} ${events.map((event) => event.name).join(',')}`)).toEqual([
      '2026-10-07 ',
      '2026-10-14 Costumes',
      '2026-10-21 ',
      '2026-10-28 Costumes,Auction',
    ]);
  });

  it('attaches no events to a meetup without special events', () => {
    expect(upcomingOccurrences([weekly], WEDNESDAY_NOON, 1)[0]?.events).toEqual([]);
  });
});

describe('remainingDates', () => {
  const meetup = aMeetup({ 'end-time': '22:00' });

  it('keeps future dates, soonest first, and drops past ones', () => {
    const event = aSpecialEvent({ dates: ['2026-10-28', '2026-09-30', '2026-10-14'] });

    expect(remainingDates(event, meetup, WEDNESDAY_NOON)).toEqual(['2026-10-14', '2026-10-28']);
  });

  it("keeps today's date until the meetup ends", () => {
    const event = aSpecialEvent({ dates: ['2026-10-07'] });

    expect(remainingDates(event, meetup, { date: '2026-10-07', minutesSinceMidnight: 21 * 60 + 59 })).toEqual(['2026-10-07']);
    expect(remainingDates(event, meetup, { date: '2026-10-07', minutesSinceMidnight: 22 * 60 })).toEqual([]);
  });
});
