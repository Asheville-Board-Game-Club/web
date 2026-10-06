/** @jest-environment jsdom */
import { scrollToHash } from './scroll-to-hash';

describe('scrollToHash', () => {
  const scrollIntoView = jest.fn<ReturnType<Element['scrollIntoView']>, Parameters<Element['scrollIntoView']>>();

  beforeEach(() => {
    scrollIntoView.mockReset();
    document.body.innerHTML = '<div id="weekly-halloween"></div><div id="weekly-café"></div>';
    for (const element of document.querySelectorAll('div')) {
      element.scrollIntoView = scrollIntoView;
    }
  });

  it('scrolls to the element the hash names', () => {
    scrollToHash(document, '#weekly-halloween');

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView.mock.contexts[0]).toBe(document.getElementById('weekly-halloween'));
  });

  it('decodes the hash', () => {
    scrollToHash(document, '#weekly-caf%C3%A9');

    expect(scrollIntoView.mock.contexts[0]).toBe(document.getElementById('weekly-café'));
  });

  it.each(['', '#', '#missing'])('does nothing for the hash %j', (hash) => {
    scrollToHash(document, hash);

    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
