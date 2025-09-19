import { useState, useEffect, useRef } from 'react';
import { NumberInput } from './components/NumberInput.tsx';
import { DEFAULT_WORK_SESSION_DURATION_MINUTES, SECONDS_IN_MINUTE } from './constants.ts';
import { formatTime } from './utils.ts';
import { useTimer } from './hooks/useTimer.ts';

export function App() {
  const [workSessionDurationMinutes, setWorkSessionDurationMinutes] = useState(
    DEFAULT_WORK_SESSION_DURATION_MINUTES
  );
  const [alarmDismissed, setAlarmDismissed] = useState(false);
  const { timeRemaining, isRunning, timerFinished, startTimer } = useTimer();

  // Play alarm when timer finishes and hasn't been dismissed
  usePlayAlarm(timeRemaining === 0 || (timerFinished && !alarmDismissed));

  const handleStart = () => {
    const totalSeconds = workSessionDurationMinutes * SECONDS_IN_MINUTE;
    setAlarmDismissed(false); // Reset alarm dismissed state
    startTimer(totalSeconds);
  };

  const handleDismissAlarm = () => {
    setAlarmDismissed(true);
  };

  return (
    <div className="app">
      {timerFinished && (
        <div>
          <p>Take 5!</p>
          {!alarmDismissed && <button onClick={handleDismissAlarm}>Dismiss Alarm</button>}
        </div>
      )}

      {!isRunning && (
        <div>
          <NumberInput
            id="work-duration"
            label="Work Session Duration (minutes):"
            value={workSessionDurationMinutes}
            placeholder={DEFAULT_WORK_SESSION_DURATION_MINUTES}
            onChange={setWorkSessionDurationMinutes}
          />
          <button onClick={handleStart}>Go!</button>
        </div>
      )}

      {timeRemaining !== null && (
        <div>
          <p>Get to work!</p>
          <h2>{formatTime(timeRemaining)}</h2>
        </div>
      )}
    </div>
  );
}

function usePlayAlarm(playAlarm: boolean): void {
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (playAlarm) {
      if (audio.current === null) {
        audio.current = new Audio('/alarm.mp3');
        audio.current.volume = 1.0;
        audio.current.loop = false;
      }

      audio.current.play().catch(console.error);
    }

    return () => {
      if (audio.current !== null) {
        audio.current.pause();
        audio.current.currentTime = 0;
      }
    };
  }, [audio, playAlarm]);
}
