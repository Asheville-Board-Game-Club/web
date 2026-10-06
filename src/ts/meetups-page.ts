import { loadMeetups } from './load-meetups';
import { renderMeetups } from './render-meetups';

const container = document.getElementById('meetups');
if (container) {
  void loadMeetups(container, window.fetch.bind(window), renderMeetups);
}
