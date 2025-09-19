import { useEffect, useState } from 'react';
import { MILLISECONDS_IN_SECOND } from '../constants.ts';

export function useTimer(args: { onFinish: () => void }): {
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

  const { onFinish } = args;
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
      onFinish();
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [onFinish, isRunning, timeRemaining]);

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
