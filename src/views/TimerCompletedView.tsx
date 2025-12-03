import { useEffect } from 'react';
import { Button } from '../components/Button.tsx';
import { ThemeToggle } from '../components/ThemeToggle.tsx';
import { useAppTheme } from '../hooks/useAppTheme.ts';
import { useAlarm } from '../hooks/useAlarm.ts';
import { APP_VERSION } from '../version.ts';

interface TimerCompletedViewProps {
  alarmEnabled: boolean;
  alarmVolume: number;
  completedWorkSessions: number;
  onDismiss: () => void;
}

export function TimerCompletedView({
  alarmEnabled,
  alarmVolume,
  completedWorkSessions,
  onDismiss,
}: TimerCompletedViewProps) {
  const { theme, toggleTheme } = useAppTheme();

  const { playAlarm, dismissAlarm } = useAlarm({
    soundEnabled: alarmEnabled,
    volume: alarmVolume,
  });

  useEffect(() => {
    playAlarm();
  }, []);

  const handleDismiss = () => {
    dismissAlarm();
    onDismiss();
  };

  return (
    <div className="app">
      <ThemeToggle theme={theme} onToggle={toggleTheme} />

      <div>
        <p>Completed work sessions: {completedWorkSessions}</p>
      </div>

      <div>
        <h2>Take a break</h2>
        <Button onClick={handleDismiss}>Dismiss Alarm</Button>
      </div>

      <p className="version">v{APP_VERSION}</p>
    </div>
  );
}
