import { useState, useEffect } from 'react';
import { Button } from '../components/Button.tsx';
import { ProgressBar } from '../components/ProgressBar.tsx';
import { ThemeToggle } from '../components/ThemeToggle.tsx';
import { useAppTheme } from '../hooks/useAppTheme.ts';
import { useTimer } from '../hooks/useTimer.ts';
import { formatTime } from '../utils.ts';
import { MILLISECONDS_IN_SECOND } from '../constants.ts';
import { APP_VERSION } from '../version.ts';

interface TimerRunningViewProps {
  durationSeconds: number;
  completedWorkSessions: number;
  onCancel: () => void;
  onFinishEarly: () => void;
  onTimerComplete: () => void;
}

export function TimerRunningView({
  durationSeconds,
  completedWorkSessions,
  onCancel,
  onFinishEarly,
  onTimerComplete,
}: TimerRunningViewProps) {
  const { theme, toggleTheme } = useAppTheme();
  const [endTime, setEndTime] = useState<Date | null>(null);

  const {
    secondsRemaining,
    startTimer,
    pauseTimer,
    resumeTimer,
    cancelTimer,
    isPaused,
  } = useTimer({
    onFinish: onTimerComplete,
  });

  useEffect(() => {
    setEndTime(new Date(Date.now() + durationSeconds * MILLISECONDS_IN_SECOND));
    startTimer(durationSeconds);
  }, []);

  const handlePause = () => {
    pauseTimer();
  };

  const handleResume = () => {
    if (secondsRemaining !== null) {
      setEndTime(new Date(Date.now() + secondsRemaining * MILLISECONDS_IN_SECOND));
    }
    resumeTimer();
  };

  const handleCancel = () => {
    cancelTimer();
    onCancel();
  };

  const handleFinishEarly = () => {
    cancelTimer();
    onFinishEarly();
  };

  if (secondsRemaining === null) {
    return null;
  }

  return (
    <div className="app">
      <ThemeToggle theme={theme} onToggle={toggleTheme} />

      <div>
        <p>Completed work sessions: {completedWorkSessions}</p>
      </div>

      <div className="timer-display">
        <ProgressBar timeRemaining={secondsRemaining} totalDuration={durationSeconds} />
        <h2 className="timer-display-countdown">
          {formatTime(secondsRemaining)}
          {endTime && (
            <span className="timer-display-end-time">
              {isPaused ? '--:--:-- --' : endTime.toLocaleTimeString()}
            </span>
          )}
        </h2>
        <Button onClick={isPaused ? handleResume : handlePause}>
          {isPaused ? 'Resume' : 'Pause'}
        </Button>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleFinishEarly}>Finish Work Session</Button>
      </div>

      <p className="version">v{APP_VERSION}</p>
    </div>
  );
}
