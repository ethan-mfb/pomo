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
  pauseTimer: () => void;
  resumeTimer: () => void;
  cancelTimer: () => void;
  isPaused: boolean;
} {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [timerFinished, setTimerFinished] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [endTime, setEndTime] = useState<number | null>(null); // Target end time in milliseconds
  const [pausedTimeRemaining, setPausedTimeRemaining] = useState<number | null>(null); // Remaining seconds when paused
  const isRunning = timeRemaining !== null && timeRemaining > 0 && !isPaused;

  const { onFinish } = args;
  useEffect(() => {
    let interval: number | null = null;

    if (!isPaused && endTime !== null) {
      const updateTimeRemaining = () => {
        const now = Date.now();
        const remainingMs = endTime - now;
        // Use Math.ceil to round up - ensures we display 1 second until we've truly passed the end time.
        // This prevents showing 0 seconds before the timer actually completes.
        const remainingSeconds = Math.ceil(remainingMs / MILLISECONDS_IN_SECOND);

        if (remainingSeconds <= 0) {
          // Collapse straight to the idle `null` on finish; there is no observable
          // intermediate 0 state, so no post-finish cleanup pass is needed.
          setTimeRemaining(null);
          setEndTime(null);
          setTimerFinished(true);
          onFinish();
        } else {
          setTimeRemaining(remainingSeconds);
        }
      };

      // Call immediately before starting interval to update display without delay.
      // Without this, there would be a 100ms wait before the first update, causing a brief stale display.
      updateTimeRemaining();

      // Check every 100ms for smoother updates and better accuracy
      interval = window.setInterval(updateTimeRemaining, 100);
    }

    return () => {
      if (interval !== null) {
        window.clearInterval(interval);
      }
    };
  }, [onFinish, isPaused, endTime]);

  const startTimer = (durationInSeconds: number) => {
    const targetEndTime = Date.now() + durationInSeconds * MILLISECONDS_IN_SECOND;
    setEndTime(targetEndTime);
    setTimeRemaining(durationInSeconds);
    setIsPaused(false);
    setPausedTimeRemaining(null);
    setTimerFinished(false);
  };

  const pauseTimer = () => {
    if (timeRemaining !== null) {
      setPausedTimeRemaining(timeRemaining);
      setEndTime(null); // Clear end time to stop calculations
    }
    setIsPaused(true);
  };

  const resumeTimer = () => {
    if (pausedTimeRemaining !== null) {
      // Calculate new end time based on remaining time when paused
      const targetEndTime = Date.now() + pausedTimeRemaining * MILLISECONDS_IN_SECOND;
      setEndTime(targetEndTime);
      setPausedTimeRemaining(null);
      setTimerFinished(false);
    }
    setIsPaused(false);
  };

  const cancelTimer = () => {
    setTimeRemaining(null);
    setIsPaused(false);
    setTimerFinished(false);
    setEndTime(null);
    setPausedTimeRemaining(null);
  };

  return {
    timeRemaining,
    isRunning,
    timerFinished,
    startTimer,
    pauseTimer,
    resumeTimer,
    cancelTimer,
    isPaused,
  };
}
