// AIDEV-NOTE: Toggles <details> itself, not the browser, so it can measure each change and animate it (FLIP).
// Relies on the CSS keeping the summary image at the box's right edge both open and closed.
const TIMING: KeyframeAnimationOptions = { duration: 200, easing: 'ease-out' };

interface Snapshot {
  box: DOMRect;
  image: DOMRect | undefined;
}

function summaryImage(details: HTMLDetailsElement): HTMLImageElement | null {
  return details.querySelector('summary img');
}

function snapshot(details: HTMLDetailsElement): Snapshot {
  return { box: details.getBoundingClientRect(), image: summaryImage(details)?.getBoundingClientRect() };
}

// Offsets are taken from the box's top right because that is where the image is anchored, so they stay
// right while the box itself is still resizing.
function imageInversion(first: Snapshot, firstImage: DOMRect, last: Snapshot, lastImage: DOMRect): string {
  const dx = firstImage.right - first.box.right - (lastImage.right - last.box.right);
  const dy = firstImage.top - first.box.top - (lastImage.top - last.box.top);
  return `translate(${dx}px, ${dy}px) scale(${firstImage.width / lastImage.width})`;
}

function play(details: HTMLDetailsElement, first: Snapshot, last: Snapshot): void {
  const size = ({ box }: Snapshot): Keyframe => ({ width: `${box.width}px`, height: `${box.height}px`, overflow: 'hidden' });
  details.animate([size(first), size(last)], TIMING);

  const image = summaryImage(details);
  // A width of 0 means the image hasn't loaded, so there is nothing sensible to scale from.
  if (image && first.image && last.image && last.image.width > 0) {
    image.animate(
      [
        { transform: imageInversion(first, first.image, last, last.image), transformOrigin: 'top right' },
        { transform: 'none', transformOrigin: 'top right' },
      ],
      TIMING,
    );
  }

  if (details.open) {
    for (const content of details.querySelectorAll('summary ~ *')) {
      content.animate([{ opacity: 0 }, { opacity: 1 }], TIMING);
    }
  }
}

/**
 * Opens and closes the <details> inside `root` from a click on its summary, or anywhere inside it when open.
 * Opening one closes the others that share its name.
 */
export function toggleDetailsOnClick(root: HTMLElement, animated: boolean): void {
  function openInGroup(details: HTMLDetailsElement): HTMLDetailsElement[] {
    const name = details.getAttribute('name');
    return Array.from(root.querySelectorAll<HTMLDetailsElement>('details[open]')).filter(
      (other) => name !== null && other.getAttribute('name') === name,
    );
  }

  function toggle(details: HTMLDetailsElement): void {
    const opening = !details.open;
    const changing = [details, ...(opening ? openInGroup(details) : [])];
    const apply = (): void => {
      for (const each of changing) {
        each.open = each === details && opening;
      }
    };
    if (!animated) {
      apply();
      return;
    }

    const before = changing.map((each) => ({ each, first: snapshot(each) }));
    for (const animation of changing.flatMap((each) => each.getAnimations({ subtree: true }))) {
      animation.cancel();
    }
    apply();
    for (const { each, first } of before) {
      play(each, first, snapshot(each));
    }
  }

  root.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    const details = target.closest<HTMLDetailsElement>('details');
    if (details && (details.open || target.closest('summary'))) {
      // Stops the browser's own toggle, which would undo this one.
      event.preventDefault();
      toggle(details);
    }
  });
}
