import { ProgressBar } from './ProgressBar.tsx';
import { Button } from './Button.tsx';
import { formatTime } from '../utils.ts';

interface TimerDisplayProps {
  secondsRemaining: number;
  totalDuration: number;
  endTime: Date | null;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onFinishEarly: () => void;
}

export function TimerDisplay({
  secondsRemaining,
  totalDuration,
  endTime,
  isPaused,
  onPause,
  onResume,
  onCancel,
  onFinishEarly,
}: TimerDisplayProps) {
  return (
    <div className="timer-display">
      <ProgressBar timeRemaining={secondsRemaining} totalDuration={totalDuration} />
      <h2 className="timer-display-countdown">
        {formatTime(secondsRemaining)}
        {endTime && (
          <span className="timer-display-end-time">
            {isPaused ? '--:--:-- --' : endTime.toLocaleTimeString()}
          </span>
        )}
      </h2>
      <Button onClick={isPaused ? onResume : onPause}>
        {isPaused ? 'Resume' : 'Pause'}
      </Button>
      <Button onClick={onCancel}>Cancel</Button>
      <Button onClick={onFinishEarly}>Finish Work Session</Button>
    </div>
  );
}
