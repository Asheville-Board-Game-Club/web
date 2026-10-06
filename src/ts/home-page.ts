import { ashevilleDateTime } from './asheville-clock';
import { loadMeetups } from './load-meetups';
import { renderUpcoming } from './render-upcoming';
import { UPCOMING_DAYS, upcomingOccurrences } from './upcoming-meetups';

const container = document.getElementById('upcoming-meetups');
if (container) {
  const now = ashevilleDateTime(new Date());
  void loadMeetups(container, window.fetch.bind(window), (meetups) =>
    renderUpcoming(upcomingOccurrences(meetups, now, UPCOMING_DAYS), now.date),
  );
}
