/** @jest-environment jsdom */
import type { Meetup } from './meetup';
import { LOAD_ERROR_HTML, loadMeetups, MEETUPS_URL } from './load-meetups';
import { aMeetup } from './test-meetup';

function aResponse(ok: boolean, body: unknown): Response {
  return { ok, json: () => Promise.resolve(body) } as Response;
}

describe('loadMeetups', () => {
  const fetchFn = jest.fn<Promise<Response>, Parameters<typeof fetch>>();
  let container: HTMLElement;

  beforeEach(() => {
    fetchFn.mockReset();
    container = document.createElement('div');
    container.innerHTML = 'Loading…';
  });

  it('fetches the meetups data and renders it into the container', async () => {
    const meetups: Meetup[] = [aMeetup({ id: 'first' }), aMeetup({ id: 'second' })];
    fetchFn.mockResolvedValue(aResponse(true, meetups));

    await loadMeetups(container, fetchFn);

    expect(fetchFn).toHaveBeenCalledWith(MEETUPS_URL);
    expect(Array.from(container.querySelectorAll('section.card'), (card) => card.id)).toEqual(['first', 'second']);
  });

  it('shows an error when the server responds with a failure', async () => {
    fetchFn.mockResolvedValue(aResponse(false, [aMeetup()]));

    await loadMeetups(container, fetchFn);

    expect(container.innerHTML).toBe(LOAD_ERROR_HTML);
  });

  it('shows an error when the request fails', async () => {
    fetchFn.mockRejectedValue(new TypeError('Failed to fetch'));

    await loadMeetups(container, fetchFn);

    expect(container.innerHTML).toBe(LOAD_ERROR_HTML);
  });

  it('shows an error when the data cannot be rendered', async () => {
    fetchFn.mockResolvedValue(aResponse(true, [aMeetup({ 'start-time': 'noon' })]));

    await loadMeetups(container, fetchFn);

    expect(container.innerHTML).toBe(LOAD_ERROR_HTML);
  });
});
