import React, { useState, useCallback, useEffect, useRef } from 'react';
import { NumberInput } from './components/NumberInput.tsx';

// TODO: add a button to pause the current session that can be used to resume the session once paused
// TODO: instead of tracking the time for the break (short and long term sessions), just log the event and make the next go event simply ends the break session and logs that it is finished

// Default configuration constants
const DEFAULTS = {
  WORK_MINUTES: 25,
  BREAK_MINUTES: 5,
  SESSIONS_BEFORE_LONG_BREAK: 4,
  LONG_BREAK_MINUTES: 30,
} as const;

type SessionType = 'work' | 'break' | 'long_break';
type SessionState = {
  type: SessionType;
  startedAt: number; // epoch ms
  durationMs: number;
  endsAt: number;
  remainingMs: number;
  inProgress: boolean;
};
type LogEntry = {
  time: string;
  message: string;
  level?: 'info' | 'warn' | 'error';
};

export function App() {
  const [workMinutes, setWorkMinutes] = useState<number>(DEFAULTS.WORK_MINUTES);
  const [breakMinutes, setBreakMinutes] = useState<number>(DEFAULTS.BREAK_MINUTES);
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = useState<number>(
    DEFAULTS.SESSIONS_BEFORE_LONG_BREAK
  );
  const [longBreakMinutes, setLongBreakMinutes] = useState<number>(DEFAULTS.LONG_BREAK_MINUTES);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [session, setSession] = useState<SessionState | null>(null);
  const [workSinceLongBreak, setWorkSinceLongBreak] = useState<number>(0);
  const lastEndedTypeRef = useRef<SessionType | null>(null);
  const prevConfigRef = useRef<{
    workMinutes: number;
    breakMinutes: number;
    sessionsBeforeLongBreak: number;
    longBreakMinutes: number;
  }>({
    workMinutes: DEFAULTS.WORK_MINUTES,
    breakMinutes: DEFAULTS.BREAK_MINUTES,
    sessionsBeforeLongBreak: DEFAULTS.SESSIONS_BEFORE_LONG_BREAK,
    longBreakMinutes: DEFAULTS.LONG_BREAK_MINUTES,
  });

  const timestamp = () => new Date().toISOString();

  const snapshotConfig = useCallback(
    () => ({
      workMinutes,
      breakMinutes,
      sessionsBeforeLongBreak,
      longBreakMinutes,
    }),
    [workMinutes, breakMinutes, sessionsBeforeLongBreak, longBreakMinutes]
  );

  const logMessage = useCallback((message: string, level: LogEntry['level'] = 'info') => {
    setLog((l) => [{ time: timestamp(), message, level }, ...l]);
  }, []);

  const resetConfig = useCallback(() => {
    setWorkMinutes(DEFAULTS.WORK_MINUTES);
    setBreakMinutes(DEFAULTS.BREAK_MINUTES);
    setSessionsBeforeLongBreak(DEFAULTS.SESSIONS_BEFORE_LONG_BREAK);
    setLongBreakMinutes(DEFAULTS.LONG_BREAK_MINUTES);
    prevConfigRef.current = {
      workMinutes: DEFAULTS.WORK_MINUTES,
      breakMinutes: DEFAULTS.BREAK_MINUTES,
      sessionsBeforeLongBreak: DEFAULTS.SESSIONS_BEFORE_LONG_BREAK,
      longBreakMinutes: DEFAULTS.LONG_BREAK_MINUTES,
    };
    logMessage('Configuration reset to defaults.');
  }, [logMessage]);

  const decideNextType = useCallback((): SessionType => {
    if (!lastEndedTypeRef.current) return 'work'; // initial
    if (lastEndedTypeRef.current === 'work') {
      // choose break vs long_break
      if (workSinceLongBreak >= sessionsBeforeLongBreak) return 'long_break';
      return 'break';
    }
    // after any break => work
    return 'work';
  }, [workSinceLongBreak, sessionsBeforeLongBreak]);

  const durationForType = useCallback(
    (t: SessionType): number => {
      switch (t) {
        case 'work':
          return workMinutes;
        case 'break':
          return breakMinutes;
        case 'long_break':
          return longBreakMinutes;
      }
    },
    [workMinutes, breakMinutes, longBreakMinutes]
  );

  const startNextSession = () => {
    if (session?.inProgress) {
      logMessage('Session already in progress.', 'warn');
      return;
    }
    const currentConfig = snapshotConfig();
    const prev = prevConfigRef.current;
    const changed: string[] = [];
    (Object.keys(currentConfig) as Array<keyof typeof currentConfig>).forEach((k) => {
      if (currentConfig[k] !== prev[k]) changed.push(k);
    });
    if (changed.length) logMessage(`Configuration changed: ${changed.join(', ')}.`);
    const type = decideNextType();
    const durationMin = durationForType(type);
    const startedAt = Date.now();
    const durationMs = durationMin * 60_000;
    const endsAt = startedAt + durationMs;
    const newSession: SessionState = {
      type,
      startedAt,
      durationMs,
      endsAt,
      remainingMs: durationMs,
      inProgress: true,
    };
    setSession(newSession);
    logMessage(`Started ${type.replace('_', ' ')} session (${durationMin} min).`);
    prevConfigRef.current = currentConfig;
  };

  // ticking effect
  useEffect(() => {
    if (!session || !session.inProgress) return;
    const id = setInterval(() => {
      setSession((s) => {
        if (!s) return s;
        const remaining = s.endsAt - Date.now();
        if (remaining <= 0) {
          return { ...s, inProgress: false, remainingMs: 0 };
        }
        return { ...s, remainingMs: remaining };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [session]);

  // session completion bookkeeping
  useEffect(() => {
    if (session && !session.inProgress && lastEndedTypeRef.current !== session.type) {
      lastEndedTypeRef.current = session.type;
      if (session.type === 'work') {
        const next = workSinceLongBreak + 1;
        setWorkSinceLongBreak(next);
      } else if (session.type === 'long_break') {
        setWorkSinceLongBreak(0);
      }
      logMessage(`Finished ${session.type.replace('_', ' ')} session.`);
    }
  }, [session, workSinceLongBreak, logMessage]);

  const fullReset = useCallback(() => {
    setSession(null);
    setWorkSinceLongBreak(0);
    lastEndedTypeRef.current = null;
    setLog([]);
    prevConfigRef.current = snapshotConfig();
    logMessage('State reset (cleared session & log).');
  }, [logMessage, snapshotConfig]);

  return (
    <div className="app">
      <h1>Pomo PWA</h1>

      <section>
        <h2>Configuration</h2>
        <NumberInput
          id="workMinutes"
          label="Work Session (minutes):"
          value={workMinutes}
          onChange={setWorkMinutes}
          min={1}
          placeholder={DEFAULTS.WORK_MINUTES}
          disabled={session?.inProgress === true}
        />
        <NumberInput
          id="breakMinutes"
          label="Break Session (minutes):"
          value={breakMinutes}
          onChange={setBreakMinutes}
          min={1}
          placeholder={DEFAULTS.BREAK_MINUTES}
          disabled={session?.inProgress === true}
        />
        <NumberInput
          id="sessionsBeforeLongBreak"
          label="Work Sessions Before Long Break:"
          value={sessionsBeforeLongBreak}
          onChange={setSessionsBeforeLongBreak}
          min={1}
          placeholder={DEFAULTS.SESSIONS_BEFORE_LONG_BREAK}
          disabled={session?.inProgress === true}
        />
        <NumberInput
          id="longBreakMinutes"
          label="Long Break (minutes):"
          value={longBreakMinutes}
          onChange={setLongBreakMinutes}
          min={1}
          placeholder={DEFAULTS.LONG_BREAK_MINUTES}
          disabled={session?.inProgress === true}
        />
        <div>
          <button type="button" onClick={resetConfig}>
            Reset to defaults
          </button>
        </div>
      </section>

      <section>
        <h2>Current Session</h2>
        <div>
          <button type="button" onClick={startNextSession} disabled={session?.inProgress === true}>
            {session?.inProgress ? 'Running…' : 'Go'}
          </button>
        </div>
        {session?.inProgress === true && (
          <div>
            <button
              type="button"
              onClick={() => {
                throw new Error('TODO: implement');
              }}
            >
              Pause
            </button>
          </div>
        )}
        <div>
          <button type="button" onClick={fullReset}>
            Reset
          </button>
        </div>
        {session ? (
          <div>
            <p>
              Type: <strong>{session.type.replace('_', ' ')}</strong>
            </p>
            <p>
              Remaining: {Math.max(0, Math.floor(session.remainingMs / 1000 / 60))}:
              {String(Math.max(0, Math.floor((session.remainingMs / 1000) % 60))).padStart(2, '0')}
            </p>
            <p>Status: {session.inProgress ? 'In progress' : 'Finished'}</p>
            <p>
              Work sessions since long break: <strong>{workSinceLongBreak}</strong> /{' '}
              {sessionsBeforeLongBreak}
            </p>
          </div>
        ) : (
          <p>No session active.</p>
        )}
      </section>

      <section>
        <h2>Log</h2>
        {log.length === 0 ? (
          <p>No events yet.</p>
        ) : (
          <ul>
            {log.map((entry, i) => (
              <li key={i}>
                [{entry.time}]: {entry.message}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
