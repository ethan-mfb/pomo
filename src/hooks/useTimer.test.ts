import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useTimer } from './useTimer.ts';

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts idle with no time remaining', () => {
    const { result } = renderHook(() => useTimer({ onFinish: vi.fn() }));

    expect(result.current.timeRemaining).toBeNull();
    expect(result.current.isRunning).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.timerFinished).toBe(false);
  });

  it('counts down derived from wall-clock time', () => {
    const { result } = renderHook(() => useTimer({ onFinish: vi.fn() }));

    act(() => result.current.startTimer(60));
    expect(result.current.timeRemaining).toBe(60);
    expect(result.current.isRunning).toBe(true);

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.timeRemaining).toBe(59);

    act(() => vi.advanceTimersByTime(9000));
    expect(result.current.timeRemaining).toBe(50);
  });

  it('rounds up remaining seconds so it never shows 0 before finishing', () => {
    const { result } = renderHook(() => useTimer({ onFinish: vi.fn() }));

    act(() => result.current.startTimer(60));
    // 59.9s left after 100ms — should still display 60 (ceil), not 59.
    act(() => vi.advanceTimersByTime(100));
    expect(result.current.timeRemaining).toBe(60);
  });

  it('calls onFinish exactly once and marks finished when it reaches zero', () => {
    const onFinish = vi.fn();
    const { result } = renderHook(() => useTimer({ onFinish }));

    act(() => result.current.startTimer(60));
    act(() => vi.advanceTimersByTime(60000));

    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(result.current.timerFinished).toBe(true);
    expect(result.current.isRunning).toBe(false);
    // After finishing, the derived remaining collapses back to null.
    expect(result.current.timeRemaining).toBeNull();
  });

  it('pauses without losing remaining time and does not keep counting', () => {
    const { result } = renderHook(() => useTimer({ onFinish: vi.fn() }));

    act(() => result.current.startTimer(60));
    act(() => vi.advanceTimersByTime(10000));
    expect(result.current.timeRemaining).toBe(50);

    act(() => result.current.pauseTimer());
    expect(result.current.isPaused).toBe(true);
    expect(result.current.isRunning).toBe(false);

    // Time keeps passing in the real world, but a paused timer must not move.
    act(() => vi.advanceTimersByTime(30000));
    expect(result.current.timeRemaining).toBe(50);
  });

  it('resumes from the snapshotted remaining time', () => {
    const { result } = renderHook(() => useTimer({ onFinish: vi.fn() }));

    act(() => result.current.startTimer(60));
    act(() => vi.advanceTimersByTime(10000));
    act(() => result.current.pauseTimer());
    act(() => vi.advanceTimersByTime(30000));

    act(() => result.current.resumeTimer());
    expect(result.current.isPaused).toBe(false);
    expect(result.current.isRunning).toBe(true);
    expect(result.current.timeRemaining).toBe(50);

    act(() => vi.advanceTimersByTime(10000));
    expect(result.current.timeRemaining).toBe(40);
  });

  it('cancels back to the idle state', () => {
    const onFinish = vi.fn();
    const { result } = renderHook(() => useTimer({ onFinish }));

    act(() => result.current.startTimer(60));
    act(() => vi.advanceTimersByTime(5000));

    act(() => result.current.cancelTimer());
    expect(result.current.timeRemaining).toBeNull();
    expect(result.current.isRunning).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.timerFinished).toBe(false);

    // A cancelled timer must never fire onFinish afterwards.
    act(() => vi.advanceTimersByTime(60000));
    expect(onFinish).not.toHaveBeenCalled();
  });
});
