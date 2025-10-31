import { useState } from 'react';
import { NumberInput } from './components/NumberInput.tsx';
import { ProgressBar } from './components/ProgressBar.tsx';
import { Button } from './components/Button.tsx';
import { ThemeToggle } from './components/ThemeToggle.tsx';
import { Toggle } from './components/Toggle.tsx';
import { Slider } from './components/Slider.tsx';
import {
  DEFAULT_WORK_SESSION_DURATION_MINUTES,
  MILLISECONDS_IN_SECOND,
  SECONDS_IN_MINUTE,
} from './constants.ts';
import { formatTime } from './utils.ts';
import { useTimer } from './hooks/useTimer.ts';
import { useAlarm } from './hooks/useAlarm.ts';
import { useAppTheme } from './hooks/useAppTheme.ts';
import { APP_VERSION } from './version.ts';

export function App() {
  const { theme, toggleTheme } = useAppTheme();
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [alarmVolume, setAlarmVolume] = useState(50);
  const [workSessionDurationMinutes, setWorkSessionDurationMinutes] = useState(
    DEFAULT_WORK_SESSION_DURATION_MINUTES
  );
  const [totalDuration, setTotalDuration] = useState(0);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const { playAlarm, dismissAlarm, isAlarmActive } = useAlarm({
    soundEnabled: alarmEnabled,
    volume: alarmVolume,
  });
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
  const [completedWorkSessions, setCompletedWorkSessions] = useState(0);
  const [isTestingAlarm, setIsTestingAlarm] = useState(false);

  const onStartWorkSession = () => {
    setHasBeenDismissed(false);
    const totalSeconds = workSessionDurationMinutes * SECONDS_IN_MINUTE;
    setTotalDuration(totalSeconds);
    setEndTime(new Date(Date.now() + totalSeconds * MILLISECONDS_IN_SECOND));
    dismissAlarm();
    startTimer(totalSeconds);
  };
  const onDismissAlarm = () => {
    dismissAlarm();
    setHasBeenDismissed(true);
    setCompletedWorkSessions((prev) => prev + 1);
  };

  const onCancelTimer = () => {
    cancelTimer();
    setEndTime(null);
    setHasBeenDismissed(true);
  };

  const onAlarmVolumeChange = (value: number) => {
    setAlarmVolume(value);
  };

  const onResumeTimer = () => {
    // Recalculate endTime based on current remaining time when resuming
    if (timeRemaining !== null) {
      const newEndTime = new Date(Date.now() + timeRemaining * MILLISECONDS_IN_SECOND);
      setEndTime(newEndTime);
    }
    resumeTimer();
  };

  const onToggleAlarmTest = () => {
    if (isTestingAlarm) {
      dismissAlarm();
      setIsTestingAlarm(false);
    } else {
      playAlarm();
      setIsTestingAlarm(true);
    }
  };

  return (
    <div className="app">
      <ThemeToggle theme={theme} onToggle={toggleTheme} />
      <p>Completed work sessions: {completedWorkSessions}</p>

      {timerFinished && isAlarmActive && !isTestingAlarm && (
        <div>
          <h2>Take a break</h2>
          <Button onClick={onDismissAlarm}>Dismiss Alarm</Button>
        </div>
      )}

      {!isRunning && hasBeenDismissed && (
        <div>
          <Toggle
            id="alarm-toggle"
            label="Alarm"
            className="alarm-toggle"
            checked={alarmEnabled}
            onChange={setAlarmEnabled}
          />
          {alarmEnabled && (
            <>
              <Slider
                id="alarm-volume"
                label="Alarm Volume:"
                value={alarmVolume}
                onChange={onAlarmVolumeChange}
                min={0}
                max={100}
                showValue={true}
              />
              <Button onClick={onToggleAlarmTest} className="alarm-test-button">
                {isTestingAlarm ? 'Stop Test' : 'Test Alarm'}
              </Button>
            </>
          )}
          <NumberInput
            id="work-duration"
            label="Work Session Duration (minutes):"
            value={workSessionDurationMinutes}
            placeholder={DEFAULT_WORK_SESSION_DURATION_MINUTES}
            onChange={setWorkSessionDurationMinutes}
          />
          <Button onClick={onStartWorkSession}>Go!</Button>
        </div>
      )}

      {timeRemaining !== null && (
        <div className="timer-display">
          <ProgressBar timeRemaining={timeRemaining} totalDuration={totalDuration} />
          <h2 className="timer-display-countdown">
            {formatTime(timeRemaining)}
            {endTime && (
              <span className="timer-display-end-time">
                {isPaused ? '--:--:-- --' : endTime.toLocaleTimeString()}
              </span>
            )}
          </h2>
          <Button onClick={isPaused ? onResumeTimer : pauseTimer}>
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button onClick={onCancelTimer}>Cancel</Button>
        </div>
      )}
      <div className="version">v{APP_VERSION}</div>
    </div>
  );
}
