import { useState } from 'react';
import { Button } from '../components/Button.tsx';
import { Toggle } from '../components/Toggle.tsx';
import { Slider } from '../components/Slider.tsx';
import { NumberInput } from '../components/NumberInput.tsx';
import { ThemeToggle } from '../components/ThemeToggle.tsx';
import { useAppTheme } from '../hooks/useAppTheme.ts';
import { useAlarm } from '../hooks/useAlarm.ts';
import { DEFAULT_WORK_SESSION_DURATION_MINUTES, SECONDS_IN_MINUTE } from '../constants.ts';
import { APP_VERSION } from '../version.ts';

interface IdleViewProps {
  completedWorkSessions: number;
  onResetWorkSessionCount: () => void;
  onStartWorkSession: (durationSeconds: number, alarmEnabled: boolean, alarmVolume: number) => void;
}

export function IdleView({
  completedWorkSessions,
  onResetWorkSessionCount,
  onStartWorkSession,
}: IdleViewProps) {
  const { theme, toggleTheme } = useAppTheme();
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [alarmVolume, setAlarmVolume] = useState(50);
  const [workSessionDurationMinutes, setWorkSessionDurationMinutes] = useState(
    DEFAULT_WORK_SESSION_DURATION_MINUTES
  );
  const [isTestingAlarm, setIsTestingAlarm] = useState(false);

  const { playAlarm, dismissAlarm } = useAlarm({
    soundEnabled: alarmEnabled,
    volume: alarmVolume,
  });

  const handleStartWorkSession = () => {
    if (isTestingAlarm) {
      dismissAlarm();
      setIsTestingAlarm(false);
    }
    const totalSeconds = workSessionDurationMinutes * SECONDS_IN_MINUTE;
    onStartWorkSession(totalSeconds, alarmEnabled, alarmVolume);
  };

  const handleToggleAlarmTest = () => {
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

      <div>
        <p>Completed work sessions: {completedWorkSessions}</p>
        <Button className="reset-work-session-count-button" onClick={onResetWorkSessionCount}>
          Reset Count
        </Button>
      </div>

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
              onChange={setAlarmVolume}
              min={0}
              max={100}
              showValue={true}
            />
            <Button onClick={handleToggleAlarmTest} className="alarm-test-button">
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
          onEnter={handleStartWorkSession}
        />
        <Button onClick={handleStartWorkSession}>Go!</Button>
      </div>

      <p className="version">v{APP_VERSION}</p>
    </div>
  );
}
