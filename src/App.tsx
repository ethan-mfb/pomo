import { useState } from 'react';
import { ThemeToggle } from './components/ThemeToggle.tsx';
import { WorkSessionCounter } from './components/WorkSessionCounter.tsx';
import { AlarmNotification } from './components/AlarmNotification.tsx';
import { AlarmSettings } from './components/AlarmSettings.tsx';
import { TimerDisplay } from './components/TimerDisplay.tsx';
import {
  DEFAULT_WORK_SESSION_DURATION_MINUTES,
  MILLISECONDS_IN_SECOND,
  SECONDS_IN_MINUTE,
} from './constants.ts';
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
    secondsRemaining,
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
    if (secondsRemaining !== null) {
      const newEndTime = new Date(Date.now() + secondsRemaining * MILLISECONDS_IN_SECOND);
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

  const onFinishWorkSessionEarly = () => {
    cancelTimer();
    setEndTime(null);
    setHasBeenDismissed(true);
    setCompletedWorkSessions((prev) => prev + 1);
  };

  const onResetWorkSessionCount = () => {
    setCompletedWorkSessions(0);
  };

  const showIdleState = !isRunning && hasBeenDismissed;
  const showAlarmNotification = timerFinished && isAlarmActive && !isTestingAlarm;

  return (
    <div className="app">
      <ThemeToggle theme={theme} onToggle={toggleTheme} />

      <WorkSessionCounter
        completedWorkSessions={completedWorkSessions}
        showResetButton={showIdleState}
        onResetCount={onResetWorkSessionCount}
      />

      {showAlarmNotification && <AlarmNotification onDismiss={onDismissAlarm} />}

      {showIdleState && (
        <AlarmSettings
          alarmEnabled={alarmEnabled}
          onAlarmEnabledChange={setAlarmEnabled}
          alarmVolume={alarmVolume}
          onAlarmVolumeChange={onAlarmVolumeChange}
          isTestingAlarm={isTestingAlarm}
          onToggleAlarmTest={onToggleAlarmTest}
          workSessionDurationMinutes={workSessionDurationMinutes}
          onWorkSessionDurationChange={setWorkSessionDurationMinutes}
          onStartWorkSession={onStartWorkSession}
        />
      )}

      {secondsRemaining !== null && (
        <TimerDisplay
          secondsRemaining={secondsRemaining}
          totalDuration={totalDuration}
          endTime={endTime}
          isPaused={isPaused}
          onPause={pauseTimer}
          onResume={onResumeTimer}
          onCancel={onCancelTimer}
          onFinishEarly={onFinishWorkSessionEarly}
        />
      )}

      <p className="version">v{APP_VERSION}</p>
    </div>
  );
}
