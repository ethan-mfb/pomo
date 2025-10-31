import { useState, useEffect, useRef, useCallback } from 'react';

export function useAlarm(args: { soundEnabled: boolean; volume: number }): {
  isAlarmActive: boolean;
  playAlarm: () => void;
  dismissAlarm: () => void;
} {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const { soundEnabled, volume } = args;

  const playAlarm = useCallback(() => {
    setIsAlarmActive(true);

    if (!soundEnabled) {
      return;
    }

    // Initialize audio if needed
    if (audio.current === null) {
      // Use relative path so it works under GitHub Pages base '/pomo/'
      audio.current = new Audio('alarm.mp3');
      audio.current.loop = false;
    }

    // Set volume (0-100 range converted to 0.0-1.0)
    audio.current.volume = volume / 100;

    audio.current.play().catch(console.error);
  }, [soundEnabled, volume]);

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
