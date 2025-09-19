import { useState, useEffect, useRef, useCallback } from 'react';
import { NumberInput } from './components/NumberInput.tsx';
import { DEFAULT_WORK_SESSION_DURATION_MINUTES, SECONDS_IN_MINUTE } from './constants.ts';
import { formatTime } from './utils.ts';
import { useTimer } from './hooks/useTimer.ts';

export function App() {
  const [workSessionDurationMinutes, setWorkSessionDurationMinutes] = useState(
    DEFAULT_WORK_SESSION_DURATION_MINUTES
  );
  const [isAlarmDismissed, setIsAlarmDismissed] = useState(true);
  const { timeRemaining, isRunning, timerFinished, startTimer } = useTimer();
  const { playAlarm, dismissAlarm } = useAlarm();

  useEffect(
    function playAlarmOnTimerFinish() {
      if (timeRemaining === 0) {
        playAlarm();
      }
    },
    [timeRemaining, playAlarm]
  );

  const onStartWorkSession = () => {
    setIsAlarmDismissed(false);
    const totalSeconds = workSessionDurationMinutes * SECONDS_IN_MINUTE;
    dismissAlarm();
    startTimer(totalSeconds);
  };

  const onDismissAlarm = () => {
    dismissAlarm();
    setIsAlarmDismissed(true);
  };

  return (
    <div className="app">
      {timerFinished && !isAlarmDismissed && (
        <div>
          <p>Take 5!</p>
          <button onClick={onDismissAlarm}>Dismiss Alarm</button>
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
          <button onClick={onStartWorkSession}>Go!</button>
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

function useAlarm(): {
  playAlarm: () => void;
  dismissAlarm: () => void;
} {
  const audio = useRef<HTMLAudioElement | null>(null);

  const playAlarm = useCallback(() => {
    // Initialize audio if needed
    if (audio.current === null) {
      audio.current = new Audio('/alarm.mp3');
      audio.current.volume = 1.0;
      audio.current.loop = false;
    }

    audio.current.play().catch(console.error);
  }, []);

  const dismissAlarm = useCallback(() => {
    if (audio.current !== null) {
      audio.current.pause();
      audio.current.currentTime = 0;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dismissAlarm();
    };
  }, [dismissAlarm]);

  return {
    playAlarm,
    dismissAlarm,
  };
}
