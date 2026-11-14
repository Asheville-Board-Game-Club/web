import { ashevilleDateTime } from './asheville-clock';
import { loadMeetups } from './load-meetups';
import { renderUpcoming } from './render-upcoming';
import { toggleDetailsOnClick } from './toggle-details-on-click';
import { upcomingDaysFrom, upcomingOccurrences } from './upcoming-meetups';

const container = document.getElementById('upcoming-meetups');
if (container) {
  toggleDetailsOnClick(container, !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const now = ashevilleDateTime(new Date());
  const days = upcomingDaysFrom(window.location.search);
  void loadMeetups(container, window.fetch.bind(window), (data) => renderUpcoming(upcomingOccurrences(data, now, days), now.date, days));
}
