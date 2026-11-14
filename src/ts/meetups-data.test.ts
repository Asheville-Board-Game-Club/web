// AIDEV-NOTE: Checks the real data file. `yarn build` runs this before Eleventy so a bad edit fails the deploy.
import { existsSync, readFileSync } from 'node:fs';
import type { MeetupsData } from './meetup';
import { validateMeetups } from './validate-meetups';

const DATA_FILE = 'src/data/meetups.json';

describe(DATA_FILE, () => {
  const data: unknown = JSON.parse(readFileSync(DATA_FILE, 'utf8'));

  it('is valid meetup data', () => {
    expect(validateMeetups(data)).toEqual([]);
  });

  it('only uses images that exist in the site', () => {
    const { meetups, 'special-events': events } = data as MeetupsData;
    const missing = [...meetups.map((meetup) => meetup.location['map-image']?.src), ...events.map((event) => event.image?.src)].filter(
      (src): src is string => src !== undefined && !existsSync(`src${src}`),
    );

    expect(missing).toEqual([]);
  });
});
