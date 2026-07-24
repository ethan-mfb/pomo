import { describe, it, expect, afterEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useAppTheme } from './useAppTheme.ts';
import { stubMatchMedia } from '../test/mocks.ts';

describe('useAppTheme', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.removeAttribute('data-theme');
  });

  it('defaults to dark when the OS does not prefer light', () => {
    stubMatchMedia(false);
    const { result } = renderHook(() => useAppTheme());

    expect(result.current.theme).toBe('dark');
    expect(document.body.getAttribute('data-theme')).toBe('dark');
  });

  it('defaults to light when the OS prefers light', () => {
    stubMatchMedia(true);
    const { result } = renderHook(() => useAppTheme());

    expect(result.current.theme).toBe('light');
    expect(document.body.getAttribute('data-theme')).toBe('light');
  });

  it('toggles between themes and reflects it onto document.body', () => {
    stubMatchMedia(false);
    const { result } = renderHook(() => useAppTheme());

    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe('light');
    expect(document.body.getAttribute('data-theme')).toBe('light');

    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe('dark');
    expect(document.body.getAttribute('data-theme')).toBe('dark');
  });

  it('follows OS theme changes emitted at runtime', () => {
    const media = stubMatchMedia(false);
    const { result } = renderHook(() => useAppTheme());
    expect(result.current.theme).toBe('dark');

    act(() => media.emitChange(true));
    expect(result.current.theme).toBe('light');

    act(() => media.emitChange(false));
    expect(result.current.theme).toBe('dark');
  });
});
