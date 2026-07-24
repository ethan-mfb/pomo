import { THEMES } from './constants.ts';

export type Theme = (typeof THEMES)[keyof typeof THEMES];

// A single item in the todo list.
export type Todo = {
  /** Stable unique identifier. */
  id: string;
  /** Display text (trimmed on entry). */
  text: string;
  /** True once the user has marked it done. */
  completed: boolean;
};

// Represents parameters needed to start a work/break session.
export type SessionState = {
  /** Total duration (seconds) of the session. */
  durationSeconds: number;
  /** Epoch millis when the session should end. */
  endTimestamp: number;
  /** True if this is a break session rather than work. */
  isBreak: boolean;
};
