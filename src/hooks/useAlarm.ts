import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for managing alarm sound playback.
 * Handles playing, pausing, and dismissing an alarm audio notification.
 */
export function useAlarm(args: {
  /** Whether sound playback is enabled */
  soundEnabled: boolean;
  /** Volume level (0-100) */
  volume: number;
}): {
  isAlarmActive: boolean;
  playAlarm: () => void;
  dismissAlarm: () => void;
} {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const { soundEnabled, volume } = args;

  const playAlarm = useCallback(() => {
    setIsAlarmActive(true);

    // Skip audio playback if sound is disabled (alarm state still updates)
    if (!soundEnabled) {
      return;
    }

    // Initialize audio if needed (lazy initialization for performance)
    if (audio.current === null) {
      // Use relative path so it works under GitHub Pages base '/pomo/'
      audio.current = new Audio('alarm.mp3');
      audio.current.loop = false;
    }

    // Set volume (0-100 range converted to 0.0-1.0)
    audio.current.volume = volume / 100;

    audio.current.play().catch(console.error);
  }, [soundEnabled, volume]);

  // Stops the alarm and resets the audio to the beginning
  const dismissAlarm = useCallback(() => {
    if (audio.current !== null) {
      audio.current.pause();
      setIsAlarmActive(false);
      audio.current.currentTime = 0;
    }
  }, []);

  // Cleanup: dismiss the alarm when the component unmounts to prevent orphaned audio
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
