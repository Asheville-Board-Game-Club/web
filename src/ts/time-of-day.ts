// Keeps "5:30 PM" from wrapping between the time and AM/PM.
const NO_BREAK_SPACE = '\u00a0';

/** Parses a 24-hour "HH:MM" time into minutes since midnight. */
export function minutesSinceMidnight(time: string): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) {
    throw new Error(`Invalid time "${time}"; expected 24-hour HH:MM`);
  }
  return Number(match[1]) * 60 + Number(match[2]);
}

export function formatTime(time: string): string {
  const minutes = minutesSinceMidnight(time);
  const hours = Math.floor(minutes / 60);
  const suffix = hours < 12 ? 'AM' : 'PM';
  return `${hours % 12 || 12}:${String(minutes % 60).padStart(2, '0')}${NO_BREAK_SPACE}${suffix}`;
}
