export function App() {
  return (
    <div className="app">
      <h1>Pomo PWA</h1>

      <section>
        <h2>Configuration</h2>
        <div>
          {/* how long each work session lasts */}
          <label htmlFor="duration">Set Work Session Duration (minutes): </label>
          <input type="number" name="duration" id="duration" value={25} placeholder="25" />
        </div>
        <div>
          {/* how many minutes the break session is after a work session */}
          <label htmlFor="break">Set Break Session Duration (minutes): </label>
          <input type="number" name="break" id="break" value={5} placeholder="5" />
        </div>
        <div>
          {/* how many work sessions before a long break session is taken */}
          <label htmlFor="sessionsBeforeLongBreak">
            Set Work Sessions Before Long Break Session:{' '}
          </label>
          <input
            type="number"
            name="sessionsBeforeLongBreak"
            id="sessionsBeforeLongBreak"
            value={4}
            placeholder="4"
          />
        </div>
        <div>
          {/* how many minutes the long break session lasts */}
          <label htmlFor="longBreak">Set Long Break Session Duration (minutes): </label>
          <input type="number" name="longBreak" id="longBreak" value={30} placeholder="30" />
        </div>
        <div>
          <button
            type="button"
            onClick={() => {
              // TODO: implement - this should reset the configuration values to their defaults
              throw new Error('not implemented');
            }}
          >
            Reset to defaults
          </button>
        </div>
      </section>

      <section>
        <button
          type="button"
          onClick={() => {
            // TODO: implement
            // this should start the next session based on the current state of the pomo app
            // if any of the configuration values have changed, it should use the new configuration values for the next session and the change should be logged
            // there are several session types: work session, break session, long break session
            // this should also log the event that the session has started with a timestamp and a short description of the session type that has started
            throw new Error('not implemented');
          }}
        >
          Go
        </button>
        <button
          type="button"
          onClick={() => {
            // TODO: implement
            // this should reset the timer and all state to the current configuration values
            // this should also clear the log of events that have been recorded so far
            throw new Error('not implemented');
          }}
        >
          Reset
        </button>
      </section>

      <section>
        {/* TODO: list the events with the timestamp that they happen in and a short description of the event. */}
        <h2>Log</h2>
        <ul>
          <li>[timestamp of event]: Event description</li>
        </ul>
      </section>
    </div>
  );
}
