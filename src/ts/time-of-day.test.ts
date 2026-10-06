import { formatTime, minutesSinceMidnight } from './time-of-day';

describe('minutesSinceMidnight', () => {
  it.each([
    ['00:00', 0],
    ['9:05', 545],
    ['17:30', 1050],
  ])('converts %s to %i', (time, expected) => {
    expect(minutesSinceMidnight(time)).toBe(expected);
  });

  it.each(['5:30pm', '1730', ''])('rejects %j', (time) => {
    expect(() => minutesSinceMidnight(time)).toThrow(`Invalid time "${time}"`);
  });
});

describe('formatTime', () => {
  it.each([
    ['17:30', '5:30\u00a0PM'],
    ['09:05', '9:05\u00a0AM'],
    ['00:15', '12:15\u00a0AM'],
    ['12:00', '12:00\u00a0PM'],
  ])('formats %s as %s', (time, expected) => {
    expect(formatTime(time)).toBe(expected);
  });
});
