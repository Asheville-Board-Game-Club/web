/** @jest-environment jsdom */
import { closeDetailsOnClick } from './close-details-on-click';

describe('closeDetailsOnClick', () => {
  let details: HTMLDetailsElement;

  beforeEach(() => {
    document.body.innerHTML =
      '<div id="root"><details open><summary>Name <img /></summary><p>Description <b>here</b></p></details><p id="outside">Other</p></div>';
    closeDetailsOnClick(document.getElementById('root') as HTMLElement);
    details = document.querySelector('details') as HTMLDetailsElement;
  });

  function click(selector: string): void {
    document.querySelector(selector)?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }

  it.each(['details > p', 'details b'])('closes an open details when %s inside it is clicked', (selector) => {
    click(selector);

    expect(details.open).toBe(false);
  });

  // The browser's own toggle runs after the listener; handling the click too would reopen it.
  it.each(['summary', 'summary img'])('leaves %s clicks to the browser, which closes it once', (selector) => {
    click(selector);

    expect(details.open).toBe(false);
  });

  it('ignores clicks outside any details', () => {
    click('#outside');

    expect(details.open).toBe(true);
  });
});
