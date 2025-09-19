import { useState, useEffect } from 'react';
import { NumberInput } from './components/NumberInput.tsx';

const DEFAULT_WORK_SESSION_DURATION_MINUTES = 25;
const SECONDS_IN_MINUTE = 60;
const MILLISECONDS_IN_SECOND = 1000;

export function App() {
  const [workSessionDurationMinutes, setWorkSessionDurationMinutes] = useState(
    DEFAULT_WORK_SESSION_DURATION_MINUTES
  );
  const { timeRemaining, isRunning, startTimer } = useTimer();

  const handleStart = () => {
    const totalSeconds = workSessionDurationMinutes * SECONDS_IN_MINUTE;
    startTimer(totalSeconds);
  };

  return (
    <div className="app">
      <NumberInput
        id="work-duration"
        label="Work Session Duration (minutes):"
        value={workSessionDurationMinutes}
        placeholder="25"
        onChange={setWorkSessionDurationMinutes}
      />

      {timeRemaining !== null && (
        <div className="timer-display">
          <h2>{formatTime(timeRemaining)}</h2>
          <p>{isRunning ? 'Timer running...' : 'Timer finished!'}</p>
        </div>
      )}

      <button onClick={handleStart} disabled={isRunning}>
        {isRunning ? 'Running...' : 'Start'}
      </button>
    </div>
  );
}

function useTimer() {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const isRunning = timeRemaining !== null && timeRemaining > 0;

  useEffect(() => {
    let interval: number | null = null;

    if (isRunning && timeRemaining !== null && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => (prev !== null ? prev - 1 : null));
      }, MILLISECONDS_IN_SECOND);
    } else if (timeRemaining === 0) {
      // Play sound when timer finishes
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhGjOJ0u/NdigFKHzN7t2KOwgadLrm7aZWGw==');
      audio.play().catch(() => {
        // Fallback: use system beep if audio fails
        console.log('Timer finished!');
      });
      setTimeRemaining(null);
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
    startTimer,
  };
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / SECONDS_IN_MINUTE);
  const remainingSeconds = seconds % SECONDS_IN_MINUTE;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
