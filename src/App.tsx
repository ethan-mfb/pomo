import { useState, useEffect } from 'react';
import { NumberInput } from './components/NumberInput.tsx';

const DEFAULT_WORK_SESSION_DURATION_MINUTES = 25;
const SECONDS_IN_MINUTE = 60;
const MILLISECONDS_IN_SECOND = 1000;

export function App() {
  const [workSessionDurationMinutes, setWorkSessionDurationMinutes] = useState(
    DEFAULT_WORK_SESSION_DURATION_MINUTES
  );
  const { timeRemaining, isRunning, timerFinished, startTimer } = useTimer();
  // not using `timerFinished` here because `timeRemaining` is only `0` for one render
  usePlayAlarm(timeRemaining === 0);

  const handleStart = () => {
    const totalSeconds = workSessionDurationMinutes * SECONDS_IN_MINUTE;
    startTimer(totalSeconds);
  };

  return (
    <div className="app">
      {timerFinished && <p>Take 5 !</p>}

      {!isRunning && (
        <div>
          <NumberInput
            id="work-duration"
            label="Work Session Duration (minutes):"
            value={workSessionDurationMinutes}
            placeholder="25"
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
  // Play alarm when timer finishes
  useEffect(() => {
    if (playAlarm) {
      const audio = new Audio('/alarm.mp3');
      audio.volume = 1.0;
      audio.play().catch(console.error);
    }
  }, [playAlarm]);
}

function useTimer(): {
  /** `null` when the timer is not running. */
  timeRemaining: number | null;
  /** `true` when the timer is running and `false` otherwise. */
  isRunning: boolean;
  /** `true` when the timer has finished and `false` otherwise. This will remain `true` until the timer starts again. */
  timerFinished: boolean;
  startTimer: (durationInSeconds: number) => void;
} {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [timerFinished, setTimerFinished] = useState(false);
  const isRunning = timeRemaining !== null && timeRemaining > 0;

  useEffect(() => {
    let interval: number | null = null;

    if (isRunning && timeRemaining !== null && timeRemaining > 0) {
      setTimerFinished(false);
      interval = setInterval(() => {
        setTimeRemaining((prev) => (prev !== null ? prev - 1 : null));
      }, MILLISECONDS_IN_SECOND);
    } else if (timeRemaining === 0) {
      setTimeRemaining(null);
      setTimerFinished(true);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, timeRemaining]);

  const startTimer = (durationInSeconds: number) => {
    setTimeRemaining(durationInSeconds);
  };

  return {
    timeRemaining,
    isRunning,
    timerFinished,
    startTimer,
  };
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / SECONDS_IN_MINUTE);
  const remainingSeconds = seconds % SECONDS_IN_MINUTE;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
