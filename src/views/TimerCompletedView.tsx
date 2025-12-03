import { Button } from '../components/Button.tsx';
import { ThemeToggle } from '../components/ThemeToggle.tsx';
import { useAppTheme } from '../hooks/useAppTheme.ts';
import { APP_VERSION } from '../version.ts';

interface TimerCompletedViewProps {
  completedWorkSessions: number;
  onDismiss: () => void;
}

export function TimerCompletedView({
  completedWorkSessions,
  onDismiss,
}: TimerCompletedViewProps) {
  const { theme, toggleTheme } = useAppTheme();

  return (
    <div className="app">
      <ThemeToggle theme={theme} onToggle={toggleTheme} />

      <div>
        <p>Completed work sessions: {completedWorkSessions}</p>
      </div>

      <div>
        <h2>Take a break</h2>
        <Button onClick={onDismiss}>Dismiss Alarm</Button>
      </div>

      <p className="version">v{APP_VERSION}</p>
    </div>
  );
}
