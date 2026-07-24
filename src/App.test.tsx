import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, render, screen, fireEvent } from '@testing-library/react';
import { App } from './App.tsx';
import { stubAudio, stubMatchMedia } from './test/mocks.ts';

/**
 * Integration tests that drive the real hooks through `App`'s state machine:
 * config screen -> running countdown -> finished/"take a break" -> back to config.
 */
describe('App', () => {
  beforeEach(() => {
    stubAudio();
    stubMatchMedia(false); // OS prefers dark
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    document.body.removeAttribute('data-theme');
  });

  function startSessionOfMinutes(minutes: number) {
    fireEvent.change(screen.getByLabelText(/Work Session Duration/), {
      target: { value: String(minutes) },
    });
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Go!' }));
    });
  }

  it('shows the config screen with zero completed sessions on first render', () => {
    render(<App />);

    expect(screen.getByText('Completed work sessions: 0')).toBeInTheDocument();
    expect(screen.getByLabelText(/Work Session Duration/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go!' })).toBeInTheDocument();
    expect(screen.getByText(/^v/)).toBeInTheDocument(); // footer version
  });

  it('starts a countdown and hides the config screen', () => {
    render(<App />);
    startSessionOfMinutes(1);

    expect(screen.getByText('1:00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Go!' })).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(10000));
    expect(screen.getByText('0:50')).toBeInTheDocument();
  });

  it('pauses and resumes the countdown', () => {
    render(<App />);
    startSessionOfMinutes(1);

    act(() => vi.advanceTimersByTime(10000));
    act(() => fireEvent.click(screen.getByRole('button', { name: 'Pause' })));

    // Wall-clock keeps moving, but the paused display must not.
    act(() => vi.advanceTimersByTime(30000));
    expect(screen.getByText('0:50')).toBeInTheDocument();

    act(() => fireEvent.click(screen.getByRole('button', { name: 'Resume' })));
    act(() => vi.advanceTimersByTime(10000));
    expect(screen.getByText('0:40')).toBeInTheDocument();
  });

  it('cancels a running timer and returns to the config screen', () => {
    render(<App />);
    startSessionOfMinutes(1);

    act(() => fireEvent.click(screen.getByRole('button', { name: 'Cancel' })));

    expect(screen.getByRole('button', { name: 'Go!' })).toBeInTheDocument();
    expect(screen.queryByText(/^\d+:\d\d$/)).not.toBeInTheDocument();
  });

  it('rings the alarm at zero and increments completed sessions on dismiss', () => {
    render(<App />);
    startSessionOfMinutes(1);

    act(() => vi.advanceTimersByTime(60000));

    expect(screen.getByText('Take a break')).toBeInTheDocument();
    const dismiss = screen.getByRole('button', { name: 'Dismiss Alarm' });

    act(() => fireEvent.click(dismiss));

    expect(screen.getByText('Completed work sessions: 1')).toBeInTheDocument();
    expect(screen.queryByText('Take a break')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go!' })).toBeInTheDocument();
  });

  it('toggles the theme and reflects it onto document.body', () => {
    render(<App />);
    expect(document.body.getAttribute('data-theme')).toBe('dark');

    act(() => fireEvent.click(screen.getByRole('button', { name: '◐' })));

    expect(document.body.getAttribute('data-theme')).toBe('light');
  });

  it('starts and stops the alarm test without showing the "take a break" prompt', () => {
    render(<App />);

    act(() => fireEvent.click(screen.getByRole('button', { name: 'Test Alarm' })));
    expect(screen.getByRole('button', { name: 'Stop Test' })).toBeInTheDocument();
    expect(screen.queryByText('Take a break')).not.toBeInTheDocument();

    act(() => fireEvent.click(screen.getByRole('button', { name: 'Stop Test' })));
    expect(screen.getByRole('button', { name: 'Test Alarm' })).toBeInTheDocument();
  });

  it('hides the volume slider and alarm test when the alarm is switched off', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: 'Test Alarm' })).toBeInTheDocument();

    act(() => fireEvent.click(screen.getByRole('checkbox', { name: 'Alarm' })));

    expect(screen.queryByRole('button', { name: 'Test Alarm' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Alarm Volume/)).not.toBeInTheDocument();
  });
});
