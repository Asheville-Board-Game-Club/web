import type { Meetup } from './meetup';

export const MEETUPS_URL = '/data/meetups.json';

export const LOAD_ERROR_HTML = '<p class="load-error">Sorry, the meetup schedule could not be loaded. Please try again later.</p>';

// Network failures, bad JSON, and malformed meetup data all land in the catch and show the same message.
export async function loadMeetups(container: HTMLElement, fetchFn: typeof fetch, render: (meetups: Meetup[]) => string): Promise<void> {
  try {
    const response = await fetchFn(MEETUPS_URL);
    container.innerHTML = response.ok ? render((await response.json()) as Meetup[]) : LOAD_ERROR_HTML;
  } catch {
    container.innerHTML = LOAD_ERROR_HTML;
  }
}
