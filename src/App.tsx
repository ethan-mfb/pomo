import { useState } from 'react';
import { IdleView } from './views/IdleView.tsx';
import { TimerRunningView } from './views/TimerRunningView.tsx';
import { TimerCompletedView } from './views/TimerCompletedView.tsx';
import { useAlarm } from './hooks/useAlarm.ts';
import { DEFAULT_ALARM_VOLUME } from './constants.ts';

type View =
  | { name: 'idle' }
  | { name: 'running'; durationSeconds: number; alarmEnabled: boolean; alarmVolume: number }
  | { name: 'completed' };

export function App() {
  const [currentView, setCurrentView] = useState<View>({ name: 'idle' });
  const [completedWorkSessions, setCompletedWorkSessions] = useState(0);
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [alarmVolume, setAlarmVolume] = useState(DEFAULT_ALARM_VOLUME);

  const { playAlarm, dismissAlarm } = useAlarm({
    soundEnabled: alarmEnabled,
    volume: alarmVolume,
  });

  const navigateToIdle = () => {
    setCurrentView({ name: 'idle' });
  };

  const navigateToRunning = (
    durationSeconds: number,
    alarmEnabled: boolean,
    alarmVolume: number
  ) => {
    setAlarmEnabled(alarmEnabled);
    setAlarmVolume(alarmVolume);
    setCurrentView({ name: 'running', durationSeconds, alarmEnabled, alarmVolume });
  };

  const navigateToCompleted = () => {
    setCurrentView({ name: 'completed' });
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
          completedWorkSessions={completedWorkSessions}
          onCancel={navigateToIdle}
          onFinishEarly={() => {
            setCompletedWorkSessions((prev) => prev + 1);
            navigateToIdle();
          }}
          onTimerComplete={() => {
            playAlarm();
            navigateToCompleted();
          }}
        />
      );

    case 'completed':
      return (
        <TimerCompletedView
          completedWorkSessions={completedWorkSessions}
          onDismiss={() => {
            dismissAlarm();
            setCompletedWorkSessions((prev) => prev + 1);
            navigateToIdle();
          }}
        />
      );
  }
}
