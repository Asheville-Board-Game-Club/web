/** @jest-environment jsdom */
import type { MeetupsData } from './meetup';
import { LOAD_ERROR_HTML, loadMeetups, MEETUPS_URL } from './load-meetups';
import { aMeetup, aMeetupsData, aSpecialEvent } from './test-meetup';

function aResponse(ok: boolean, body: unknown): Response {
  return { ok, json: () => Promise.resolve(body) } as Response;
}

describe('loadMeetups', () => {
  const fetchFn = jest.fn<Promise<Response>, Parameters<typeof fetch>>();
  const render = jest.fn<string, [MeetupsData]>();
  let container: HTMLElement;

  beforeEach(() => {
    fetchFn.mockReset();
    render.mockReset();
    render.mockReturnValue('<p>rendered</p>');
    container = document.createElement('div');
    container.innerHTML = 'Loading…';
  });

  it('fetches the meetups data and shows what the renderer makes of it', async () => {
    const data = aMeetupsData([aMeetup({ id: 'first' }), aMeetup({ id: 'second' })], [aSpecialEvent()]);
    fetchFn.mockResolvedValue(aResponse(true, data));

    await loadMeetups(container, fetchFn, render);

    expect(fetchFn).toHaveBeenCalledWith(MEETUPS_URL);
    expect(render).toHaveBeenCalledWith(data);
    expect(container.innerHTML).toBe('<p>rendered</p>');
  });

  it('shows an error when the server responds with a failure', async () => {
    fetchFn.mockResolvedValue(aResponse(false, aMeetupsData([aMeetup()])));

    await loadMeetups(container, fetchFn, render);

    expect(render).not.toHaveBeenCalled();
    expect(container.innerHTML).toBe(LOAD_ERROR_HTML);
  });

  it('shows an error when the request fails', async () => {
    fetchFn.mockRejectedValue(new TypeError('Failed to fetch'));

    await loadMeetups(container, fetchFn, render);

    expect(container.innerHTML).toBe(LOAD_ERROR_HTML);
  });

  it('shows an error when the data cannot be rendered', async () => {
    fetchFn.mockResolvedValue(aResponse(true, aMeetupsData([aMeetup()])));
    render.mockImplementation(() => {
      throw new Error('Invalid time');
    });

    await loadMeetups(container, fetchFn, render);

    expect(container.innerHTML).toBe(LOAD_ERROR_HTML);
  });
});
