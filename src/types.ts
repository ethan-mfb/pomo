import { THEMES } from './constants.ts';

export type Theme = (typeof THEMES)[keyof typeof THEMES];

// Represents parameters needed to start a work/break session.
export type SessionState = {
  /** Total duration (seconds) of the session. */
  durationSeconds: number;
  /** Epoch millis when the session should end. */
  endTimestamp: number;
  /** True if this is a break session rather than work. */
  isBreak: boolean;
};
