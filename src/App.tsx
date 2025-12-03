import { useState } from 'react';
import { IdleView } from './views/IdleView.tsx';
import { TimerRunningView } from './views/TimerRunningView.tsx';
import { TimerCompletedView } from './views/TimerCompletedView.tsx';

type View =
  | { name: 'idle' }
  | { name: 'running'; durationSeconds: number; alarmEnabled: boolean; alarmVolume: number }
  | { name: 'completed'; alarmEnabled: boolean; alarmVolume: number };

export function App() {
  const [currentView, setCurrentView] = useState<View>({ name: 'idle' });
  const [completedWorkSessions, setCompletedWorkSessions] = useState(0);

  const navigateToIdle = () => {
    setCurrentView({ name: 'idle' });
  };

  const navigateToRunning = (durationSeconds: number, alarmEnabled: boolean, alarmVolume: number) => {
    setCurrentView({ name: 'running', durationSeconds, alarmEnabled, alarmVolume });
  };

  const navigateToCompleted = (alarmEnabled: boolean, alarmVolume: number) => {
    setCurrentView({ name: 'completed', alarmEnabled, alarmVolume });
  };

  switch (currentView.name) {
    case 'idle':
      return (
        <IdleView
          completedWorkSessions={completedWorkSessions}
          onResetWorkSessionCount={() => setCompletedWorkSessions(0)}
          onStartWorkSession={navigateToRunning}
        />
      );

    case 'running':
      return (
        <TimerRunningView
          durationSeconds={currentView.durationSeconds}
          alarmEnabled={currentView.alarmEnabled}
          alarmVolume={currentView.alarmVolume}
          completedWorkSessions={completedWorkSessions}
          onCancel={navigateToIdle}
          onFinishEarly={() => {
            setCompletedWorkSessions((prev) => prev + 1);
            navigateToIdle();
          }}
          onTimerComplete={() => {
            navigateToCompleted(currentView.alarmEnabled, currentView.alarmVolume);
          }}
        />
      );

    case 'completed':
      return (
        <TimerCompletedView
          alarmEnabled={currentView.alarmEnabled}
          alarmVolume={currentView.alarmVolume}
          completedWorkSessions={completedWorkSessions}
          onDismiss={() => {
            setCompletedWorkSessions((prev) => prev + 1);
            navigateToIdle();
          }}
        />
      );
  }
}
