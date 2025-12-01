import { useEffect, useState } from 'react';
import { MILLISECONDS_IN_SECOND } from '../constants.ts';

const timerRefreshIntervalMs = 100; // Interval for updating the timer display

/**
 * Custom hook for managing a countdown timer with pause/resume functionality.
 * Uses absolute timestamps (Date.now()) rather than intervals for accurate timing,
 * which prevents drift issues that can occur with setInterval-based countdown approaches.
 */
export function useTimer(args: {
  /** Callback invoked when the timer reaches zero */
  onFinish: () => void;
}): {
  /** Time remaining in seconds. `null` when the timer is not running. */
  secondsRemaining: number | null;
  isRunning: boolean;
  timerFinished: boolean;
  startTimer: (durationInSeconds: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  cancelTimer: () => void;
  isPaused: boolean;
} {
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [timerFinished, setTimerFinished] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [endTimeMs, setEndTimeMs] = useState<number | null>(null);
  // used to recalculate endTime on resume
  const [pausedSecondsRemaining, setPausedSecondsRemaining] = useState<number | null>(null);
  // Derived state: timer is running only if there's time left and not paused
  const isRunning = secondsRemaining !== null && secondsRemaining > 0 && !isPaused;

  const { onFinish } = args;

  // Main timer effect - handles the countdown logic using interval polling
  useEffect(() => {
    let interval: number | null = null;
    if (!isPaused && endTimeMs !== null) {
      setTimerFinished(false);

      // Calculates remaining time by comparing current time to target end time
      const updateTimeRemaining = () => {
        const now = Date.now();
        const remainingMs = endTimeMs - now;
        // Use Math.ceil to round up - ensures we display 1 second until we've truly passed the end time.
        // This prevents showing 0 seconds before the timer actually completes.
        const remainingSeconds = Math.ceil(remainingMs / MILLISECONDS_IN_SECOND);

        if (remainingSeconds <= 0) {
          setSecondsRemaining(0);
          setEndTimeMs(null);
          setTimerFinished(true);
          onFinish();
        } else {
          setSecondsRemaining(remainingSeconds);
        }
      };

      // Call immediately before starting interval to update display without delay.
      // Without this, there would be a 100ms wait before the first update, causing a brief stale display.
      updateTimeRemaining();

      // refresh the time remaining
      interval = window.setInterval(updateTimeRemaining, timerRefreshIntervalMs);
    } else if (secondsRemaining === 0) {
      // Clean up after timer finishes
      setSecondsRemaining(null);
      setEndTimeMs(null);
    }

    // Cleanup interval on unmount or when dependencies change
    return () => {
      if (interval !== null) {
        window.clearInterval(interval);
      }
    };
  }, [onFinish, isPaused, endTimeMs, secondsRemaining]);

  const startTimer = (durationInSeconds: number) => {
    const targetEndTime = Date.now() + durationInSeconds * MILLISECONDS_IN_SECOND;
    setEndTimeMs(targetEndTime);
    setSecondsRemaining(durationInSeconds);
    setIsPaused(false);
    setPausedSecondsRemaining(null);
  };

  const pauseTimer = () => {
    if (secondsRemaining !== null) {
      setPausedSecondsRemaining(secondsRemaining);
      setEndTimeMs(null); // Clear end time to stop calculations
    }
    setIsPaused(true);
  };

  const resumeTimer = () => {
    if (pausedSecondsRemaining !== null) {
      // Calculate new end time based on remaining time when paused
      const targetEndTime = Date.now() + pausedSecondsRemaining * MILLISECONDS_IN_SECOND;
      setEndTimeMs(targetEndTime);
      setPausedSecondsRemaining(null);
    }
    setIsPaused(false);
  };

  // Completely resets the timer to its initial inactive state
  const cancelTimer = () => {
    setSecondsRemaining(null);
    setIsPaused(false);
    setTimerFinished(false);
    setEndTimeMs(null);
    setPausedSecondsRemaining(null);
  };

  return {
    secondsRemaining: secondsRemaining,
    isRunning,
    timerFinished,
    startTimer,
    pauseTimer,
    resumeTimer,
    cancelTimer,
    isPaused,
  };
}
