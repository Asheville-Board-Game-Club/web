/** @jest-environment jsdom */
import { toggleDetailsOnClick } from './toggle-details-on-click';

type Animate = jest.Mock<ReturnType<Element['animate']>, Parameters<Element['animate']>>;

function byId<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}

function click(selector: string): void {
  document.querySelector(selector)?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
}

function rect(top: number, right: number, width: number, height: number): DOMRect {
  return { top, right, width, height } as DOMRect;
}

describe('toggleDetailsOnClick', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="root">
        <details id="one" name="events"><summary>One <img id="one-image" /></summary><p>Body <b>here</b></p></details>
        <details id="two" name="events" open><summary>Two</summary><p>Two's body</p></details>
        <details id="three" name="other" open><summary>Three</summary><p>Three's body</p></details>
        <details id="four"><summary>Four</summary><p>Four's body</p></details>
        <details id="five" open><summary>Five</summary><p>Five's body</p></details>
      </div>
      <p id="outside">Other</p>`;
  });

  describe('without animation', () => {
    beforeEach(() => {
      toggleDetailsOnClick(byId('root'), false);
    });

    it.each(['#one summary', '#one-image'])('opens a closed details from %s, once', (selector) => {
      click(selector);

      expect(byId<HTMLDetailsElement>('one').open).toBe(true);
    });

    it.each(['#two summary', '#two p'])('closes an open details from %s', (selector) => {
      click(selector);

      expect(byId<HTMLDetailsElement>('two').open).toBe(false);
    });

    it('closes the others that share its name when it opens', () => {
      click('#one summary');

      expect(byId<HTMLDetailsElement>('two').open).toBe(false);
      expect(byId<HTMLDetailsElement>('three').open).toBe(true);
    });

    it('leaves other details open when one without a name opens', () => {
      click('#four summary');

      expect(byId<HTMLDetailsElement>('five').open).toBe(true);
    });

    it('ignores clicks outside any details', () => {
      click('#outside');

      expect(byId<HTMLDetailsElement>('two').open).toBe(true);
    });
  });

  describe('animated', () => {
    const cancel = jest.fn<ReturnType<Animation['cancel']>, Parameters<Animation['cancel']>>();
    const animations = new Map<string, Animate>();

    function animateOf(selector: string): Animate {
      return animations.get(selector) as Animate;
    }

    beforeEach(() => {
      cancel.mockReset();
      animations.clear();
      for (const selector of ['#one', '#two', '#three', '#one-image', '#one p', '#two p']) {
        const animate: Animate = jest.fn<ReturnType<Element['animate']>, Parameters<Element['animate']>>();
        animations.set(selector, animate);
        (document.querySelector(selector) as Element).animate = animate;
      }
      for (const details of document.querySelectorAll('details')) {
        details.getAnimations = jest
          .fn<ReturnType<Element['getAnimations']>, Parameters<Element['getAnimations']>>()
          .mockReturnValue(details.id === 'one' ? [{ cancel } as unknown as Animation] : []);
      }
      const one = byId<HTMLDetailsElement>('one');
      one.getBoundingClientRect = (): DOMRect => (one.open ? rect(100, 300, 300, 120) : rect(100, 200, 200, 40));
      byId('one-image').getBoundingClientRect = (): DOMRect => (one.open ? rect(110, 290, 128, 100) : rect(105, 180, 40, 31));
      const two = byId<HTMLDetailsElement>('two');
      two.getBoundingClientRect = (): DOMRect => (two.open ? rect(0, 250, 250, 90) : rect(0, 150, 150, 40));
      toggleDetailsOnClick(byId('root'), true);
    });

    it('animates the box from its old size to its new size', () => {
      click('#one summary');

      expect(animateOf('#one')).toHaveBeenCalledWith(
        [
          { width: '200px', height: '40px', overflow: 'hidden' },
          { width: '300px', height: '120px', overflow: 'hidden' },
        ],
        expect.anything(),
      );
    });

    it('moves and scales the image from where it was, measured from the top right of the box', () => {
      click('#one summary');

      expect(animateOf('#one-image')).toHaveBeenCalledWith(
        [
          { transform: 'translate(-10px, -5px) scale(0.3125)', transformOrigin: 'top right' },
          { transform: 'none', transformOrigin: 'top right' },
        ],
        expect.anything(),
      );
    });

    it('fades the content in when opening', () => {
      click('#one summary');

      expect(animateOf('#one p')).toHaveBeenCalledWith([{ opacity: 0 }, { opacity: 1 }], expect.anything());
    });

    it('closes without fading, and animates the box shrinking', () => {
      click('#two p');

      expect(animateOf('#two p')).not.toHaveBeenCalled();
      expect(animateOf('#two')).toHaveBeenCalledTimes(1);
      expect(animateOf('#two')).toHaveBeenCalledWith(
        [
          { width: '250px', height: '90px', overflow: 'hidden' },
          { width: '150px', height: '40px', overflow: 'hidden' },
        ],
        expect.anything(),
      );
    });

    it('animates the details it closes, and only those that change', () => {
      click('#one summary');

      expect(animateOf('#two')).toHaveBeenCalledTimes(1);
      expect(animateOf('#three')).not.toHaveBeenCalled();
    });

    it('cancels animations still running before starting new ones', () => {
      click('#one summary');

      expect(cancel).toHaveBeenCalledTimes(1);
      expect(cancel.mock.invocationCallOrder[0]).toBeLessThan(animateOf('#one').mock.invocationCallOrder[0] ?? 0);
    });

    it('skips the image when it has not loaded', () => {
      byId('one-image').getBoundingClientRect = (): DOMRect => rect(0, 0, 0, 0);

      click('#one summary');

      expect(animateOf('#one-image')).not.toHaveBeenCalled();
      expect(animateOf('#one')).toHaveBeenCalled();
    });
  });
});
