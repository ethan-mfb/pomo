import { useState, useEffect, useRef, useCallback } from 'react';

export function useAlarm(args: { soundEnabled: boolean }): {
  isAlarmActive: boolean;
  playAlarm: () => void;
  dismissAlarm: () => void;
} {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const { soundEnabled } = args;

  const playAlarm = useCallback(() => {
    setIsAlarmActive(true);

    if (!soundEnabled) {
      return;
    }

    // Initialize audio if needed
    if (audio.current === null) {
      audio.current = new Audio('/alarm.mp3');
      audio.current.volume = 1.0;
      audio.current.loop = false;
    }

    audio.current.play().catch(console.error);
  }, [soundEnabled]);

  const dismissAlarm = useCallback(() => {
    if (audio.current !== null) {
      audio.current.pause();
      setIsAlarmActive(false);
      audio.current.currentTime = 0;
    }
  }, []);

  useEffect(
    function dismissAlarmOnUnmount() {
      return dismissAlarm;
    },
    [dismissAlarm]
  );

  return {
    isAlarmActive,
    playAlarm,
    dismissAlarm,
  };
}
