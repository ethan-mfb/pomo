import React, { useState, useCallback } from 'react';
import { NumberInput } from './components/NumberInput.tsx';

// Default configuration constants
const DEFAULTS = {
  WORK_MINUTES: 25,
  BREAK_MINUTES: 5,
  SESSIONS_BEFORE_LONG_BREAK: 4,
  LONG_BREAK_MINUTES: 30,
} as const;

export function App() {
  const [workMinutes, setWorkMinutes] = useState<number>(DEFAULTS.WORK_MINUTES);
  const [breakMinutes, setBreakMinutes] = useState<number>(DEFAULTS.BREAK_MINUTES);
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = useState<number>(
    DEFAULTS.SESSIONS_BEFORE_LONG_BREAK
  );
  const [longBreakMinutes, setLongBreakMinutes] = useState<number>(DEFAULTS.LONG_BREAK_MINUTES);
  const [log, setLog] = useState<Array<{ time: string; message: string }>>([]);

  const timestamp = () => new Date().toISOString();

  const resetConfig = useCallback(() => {
    setWorkMinutes(DEFAULTS.WORK_MINUTES);
    setBreakMinutes(DEFAULTS.BREAK_MINUTES);
    setSessionsBeforeLongBreak(DEFAULTS.SESSIONS_BEFORE_LONG_BREAK);
    setLongBreakMinutes(DEFAULTS.LONG_BREAK_MINUTES);
    setLog((l) => [{ time: timestamp(), message: 'Configuration reset to defaults.' }, ...l]);
  }, []);

  return (
    <div className="app">
      <h1>Pomo PWA</h1>

      <section>
        {/* TODO: disable configuration inputs and buttons, except for reset, when a session is active */}
        <h2>Configuration</h2>
        <NumberInput
          id="workMinutes"
          label="Work Session (minutes):"
          value={workMinutes}
          onChange={setWorkMinutes}
          min={1}
          placeholder={DEFAULTS.WORK_MINUTES}
        />
        <NumberInput
          id="breakMinutes"
          label="Break Session (minutes):"
          value={breakMinutes}
          onChange={setBreakMinutes}
          min={1}
          placeholder={DEFAULTS.BREAK_MINUTES}
        />
        <NumberInput
          id="sessionsBeforeLongBreak"
          label="Work Sessions Before Long Break:"
          value={sessionsBeforeLongBreak}
          onChange={setSessionsBeforeLongBreak}
          min={1}
          placeholder={DEFAULTS.SESSIONS_BEFORE_LONG_BREAK}
        />
        <NumberInput
          id="longBreakMinutes"
          label="Long Break (minutes):"
          value={longBreakMinutes}
          onChange={setLongBreakMinutes}
          min={1}
          placeholder={DEFAULTS.LONG_BREAK_MINUTES}
        />
        <div>
          <button type="button" onClick={resetConfig}>
            Reset to defaults
          </button>
        </div>
      </section>

      <section>
        <button
          type="button"
          onClick={() => {
            // TODO: implement start session logic
            setLog((l) => [
              { time: timestamp(), message: 'Started session (not yet implemented).' },
              ...l,
            ]);
          }}
        >
          Go
        </button>
        <button
          type="button"
          onClick={() => {
            // TODO: implement full reset
            setLog((l) => [{ time: timestamp(), message: 'Reset (not yet implemented).' }, ...l]);
          }}
        >
          Reset
        </button>
      </section>

      <section>
        <h2>Log</h2>
        <ul>
          {log.map((entry, i) => (
            <li key={i}>
              [{entry.time}]: {entry.message}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
