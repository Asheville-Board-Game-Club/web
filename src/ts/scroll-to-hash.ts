// The browser's own jump to #id happens before the meetups are rendered, so it finds nothing; redo it afterwards.
export function scrollToHash(root: Document, hash: string): void {
  root.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
}
