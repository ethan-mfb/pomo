import { Button } from './Button.tsx';

interface WorkSessionCounterProps {
  completedWorkSessions: number;
  showResetButton: boolean;
  onResetCount: () => void;
}

export function WorkSessionCounter({
  completedWorkSessions,
  showResetButton,
  onResetCount,
}: WorkSessionCounterProps) {
  return (
    <div>
      <p>Completed work sessions: {completedWorkSessions}</p>
      {showResetButton && (
        <Button className="reset-work-session-count-button" onClick={onResetCount}>
          Reset Count
        </Button>
      )}
    </div>
  );
}
