import { specialEventId } from './special-event-id';
import { aMeetup, aSpecialEvent } from './test-meetup';

describe('specialEventId', () => {
  it.each([
    ['Halloween Party & Spooky Game Night', 'weekly-halloween-party-spooky-game-night'],
    ['  Piñata Night! ', 'weekly-pinata-night'],
    ['Top 10 Games', 'weekly-top-10-games'],
  ])('turns %j into a link-safe id prefixed by the meetup id', (name, expected) => {
    expect(specialEventId(aMeetup({ id: 'weekly' }), aSpecialEvent({ name }))).toBe(expected);
  });
});
