import { useState, useEffect, useRef, useCallback } from 'react';
import { NumberInput } from './components/NumberInput.tsx';
import { ProgressBar } from './components/ProgressBar.tsx';
import { DEFAULT_WORK_SESSION_DURATION_MINUTES, SECONDS_IN_MINUTE } from './constants.ts';
import { formatTime } from './utils.ts';
import { useTimer } from './hooks/useTimer.ts';

export function App() {
  const [workSessionDurationMinutes, setWorkSessionDurationMinutes] = useState(
    DEFAULT_WORK_SESSION_DURATION_MINUTES
  );
  const [totalDuration, setTotalDuration] = useState(0);
  const { playAlarm, dismissAlarm, isAlarmActive } = useAlarm();
  const {
    timeRemaining,
    isRunning,
    timerFinished,
    startTimer,
    pauseTimer,
    resumeTimer,
    cancelTimer,
    isPaused,
  } = useTimer({
    onFinish: playAlarm,
  });
  const [hasBeenDismissed, setHasBeenDismissed] = useState(true);

  const onStartWorkSession = () => {
    setHasBeenDismissed(false);
    const totalSeconds = workSessionDurationMinutes * SECONDS_IN_MINUTE;
    setTotalDuration(totalSeconds);
    dismissAlarm();
    startTimer(totalSeconds);
  };
  const onDismissAlarm = () => {
    dismissAlarm();
    setHasBeenDismissed(true);
  };

  const onCancelTimer = () => {
    cancelTimer();
    setHasBeenDismissed(true);
  };

  return (
    <div className="app">
      {timerFinished && isAlarmActive && (
        <div>
          <p>Take a break</p>
          <button onClick={onDismissAlarm}>Dismiss Alarm</button>
        </div>
      )}

      {!isRunning && hasBeenDismissed && (
        <div>
          <NumberInput
            id="work-duration"
            label="Work Session Duration (minutes):"
            value={workSessionDurationMinutes}
            placeholder={DEFAULT_WORK_SESSION_DURATION_MINUTES}
            onChange={setWorkSessionDurationMinutes}
          />
          <button onClick={onStartWorkSession}>Go!</button>
        </div>
      )}

      {timeRemaining !== null && (
        <div className="timer-display">
          <ProgressBar timeRemaining={timeRemaining} totalDuration={totalDuration} />
          <h2 className="timer-display-countdown">{formatTime(timeRemaining)}</h2>
          <button onClick={isPaused ? resumeTimer : pauseTimer}>
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button onClick={onCancelTimer}>Cancel</button>
        </div>
      )}
    </div>
  );
}

function useAlarm(): {
  isAlarmActive: boolean;
  playAlarm: () => void;
  dismissAlarm: () => void;
} {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [isAlarmActive, setIsAlarmActive] = useState(false);

  const playAlarm = useCallback(() => {
    // Initialize audio if needed
    if (audio.current === null) {
      audio.current = new Audio('/alarm.mp3');
      audio.current.volume = 1.0;
      audio.current.loop = false;
    }

    setIsAlarmActive(true);
    audio.current.play().catch(console.error);
  }, []);

  const dismissAlarm = useCallback(() => {
    if (audio.current !== null) {
      audio.current.pause();
      setIsAlarmActive(false);
      audio.current.currentTime = 0;
    }
  }, []);

  useEffect(
    function dismissAlarmOnUnmount() {
      return dismissAlarm;
    },
    [dismissAlarm]
  );

  return {
    isAlarmActive,
    playAlarm,
    dismissAlarm,
  };
}
