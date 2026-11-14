import { ashevilleDateTime } from './asheville-clock';
import { loadMeetups } from './load-meetups';
import { renderMeetups } from './render-meetups';
import { scrollToHash } from './scroll-to-hash';

const container = document.getElementById('meetups');
if (container) {
  const now = ashevilleDateTime(new Date());
  void loadMeetups(container, window.fetch.bind(window), (data) => renderMeetups(data, now)).then(() => {
    scrollToHash(document, window.location.hash);
  });
}
