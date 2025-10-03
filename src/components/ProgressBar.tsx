import './ProgressBar.scss';

interface ProgressBarProps {
  /** Current time remaining in seconds */
  timeRemaining: number;
  /** Total duration in seconds */
  totalDuration: number;
}

export function ProgressBar({ timeRemaining, totalDuration }: ProgressBarProps) {
  const progress = totalDuration > 0 ? (timeRemaining / totalDuration) * 100 : 0;

  return (
    <div className="progress-bar-container">
      <div className="progress-bar" style={{ width: `${progress}%` }} />
    </div>
  );
}
