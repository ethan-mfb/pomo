import { SECONDS_IN_MINUTE } from './constants.ts';

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / SECONDS_IN_MINUTE);
  const remainingSeconds = seconds % SECONDS_IN_MINUTE;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
