import { loadMeetups } from './load-meetups';

const container = document.getElementById('meetups');
if (container) {
  void loadMeetups(container, window.fetch.bind(window));
}
