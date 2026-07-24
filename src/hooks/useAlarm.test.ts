import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useAlarm } from './useAlarm.ts';
import { MockAudio, stubAudio } from '../test/mocks.ts';

describe('useAlarm', () => {
  beforeEach(() => {
    stubAudio();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('marks the alarm active and plays audio when sound is enabled', () => {
    const { result } = renderHook(() => useAlarm({ soundEnabled: true, volume: 50 }));

    act(() => result.current.playAlarm());

    expect(result.current.isAlarmActive).toBe(true);
    expect(MockAudio.instances).toHaveLength(1);
    // Relative path so it resolves under the '/pomo/' base.
    expect(MockAudio.instances[0].src).toBe('alarm.mp3');
    expect(MockAudio.instances[0].play).toHaveBeenCalledTimes(1);
  });

  it('maps a 0-100 volume onto the 0.0-1.0 audio range', () => {
    const { result } = renderHook(() => useAlarm({ soundEnabled: true, volume: 75 }));

    act(() => result.current.playAlarm());

    expect(MockAudio.instances[0].volume).toBe(0.75);
  });

  it('still activates the alarm UI when sound is disabled, but plays nothing', () => {
    const { result } = renderHook(() => useAlarm({ soundEnabled: false, volume: 50 }));

    act(() => result.current.playAlarm());

    expect(result.current.isAlarmActive).toBe(true);
    expect(MockAudio.instances).toHaveLength(0);
  });

  it('reuses a single audio element across repeated plays', () => {
    const { result } = renderHook(() => useAlarm({ soundEnabled: true, volume: 50 }));

    act(() => result.current.playAlarm());
    act(() => result.current.playAlarm());

    expect(MockAudio.instances).toHaveLength(1);
    expect(MockAudio.instances[0].play).toHaveBeenCalledTimes(2);
  });

  it('dismisses by pausing, rewinding, and clearing the active flag', () => {
    const { result } = renderHook(() => useAlarm({ soundEnabled: true, volume: 50 }));

    act(() => result.current.playAlarm());
    const audio = MockAudio.instances[0];
    audio.currentTime = 3;

    act(() => result.current.dismissAlarm());

    expect(audio.pause).toHaveBeenCalledTimes(1);
    expect(audio.currentTime).toBe(0);
    expect(result.current.isAlarmActive).toBe(false);
  });

  it('stops playback on unmount', () => {
    const { result, unmount } = renderHook(() => useAlarm({ soundEnabled: true, volume: 50 }));

    act(() => result.current.playAlarm());
    const audio = MockAudio.instances[0];

    unmount();

    expect(audio.pause).toHaveBeenCalled();
  });
});
