// AIDEV-NOTE: Checks the real data file. `yarn build` runs this before Eleventy so a bad edit fails the deploy.
import { existsSync, readFileSync } from 'node:fs';
import type { Meetup } from './meetup';
import { validateMeetups } from './validate-meetups';

const DATA_FILE = 'src/data/meetups.json';

describe(DATA_FILE, () => {
  const data: unknown = JSON.parse(readFileSync(DATA_FILE, 'utf8'));

  it('is valid meetup data', () => {
    expect(validateMeetups(data)).toEqual([]);
  });

  it('only uses map images that exist in the site', () => {
    const missing = (data as Meetup[])
      .map((meetup) => meetup.location['map-image']?.src)
      .filter((src): src is string => src !== undefined && !existsSync(`src${src}`));

    expect(missing).toEqual([]);
  });
});
