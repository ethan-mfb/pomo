import { LOG_LEVEL, SESSION_TYPE } from './constants.ts';

export type SessionType = (typeof SESSION_TYPE)[keyof typeof SESSION_TYPE];

export type SessionState = {
  type: SessionType;
  /** Epoch in MS */
  startedAt: number;
  durationMs: number;
  endsAt: number;
  remainingMs: number;
  inProgress: boolean;
};

export type LogEntry = {
  time: string;
  message: string;
  level?: (typeof LOG_LEVEL)[keyof typeof LOG_LEVEL];
};
