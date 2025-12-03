import { Button } from './Button.tsx';

interface AlarmNotificationProps {
  onDismiss: () => void;
}

export function AlarmNotification({ onDismiss }: AlarmNotificationProps) {
  return (
    <div>
      <h2>Take a break</h2>
      <Button onClick={onDismiss}>Dismiss Alarm</Button>
    </div>
  );
}
