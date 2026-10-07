// A <details> only toggles from its summary; this lets a click anywhere in an open one close it.
// Summary clicks are left to the browser, which would otherwise toggle the element back open.
export function closeDetailsOnClick(root: HTMLElement): void {
  root.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element) || target.closest('summary')) {
      return;
    }
    const details = target.closest<HTMLDetailsElement>('details[open]');
    if (details) {
      details.open = false;
    }
  });
}
