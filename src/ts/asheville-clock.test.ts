import { ashevilleDateTime } from './asheville-clock';

describe('ashevilleDateTime', () => {
  it.each([
    ['during daylight saving time', '2026-10-07T21:59:00Z', '2026-10-07', 17 * 60 + 59],
    ['during standard time', '2026-12-02T15:30:00Z', '2026-12-02', 10 * 60 + 30],
    ['late evening, when UTC is already the next day', '2026-10-08T03:30:00Z', '2026-10-07', 23 * 60 + 30],
    ['at midnight', '2026-10-08T04:00:00Z', '2026-10-08', 0],
  ])('gives the Asheville date and time %s', (_, instant, date, minutes) => {
    expect(ashevilleDateTime(new Date(instant))).toEqual({ date, minutesSinceMidnight: minutes });
  });
});
