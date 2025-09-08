export const SESSION_TYPE = {
  WORK: 'work',
  BREAK: 'break',
  LONG_BREAK: 'long_break',
} as const;

export const DEFAULTS = {
  WORK_MINUTES: 25,
  BREAK_MINUTES: 5,
  SESSIONS_BEFORE_LONG_BREAK: 4,
  LONG_BREAK_MINUTES: 30,
} as const;

export const LOG_LEVEL = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
} as const;
