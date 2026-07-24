import { describe, it, expect } from 'vitest';
import { formatTime } from './utils.ts';

describe('formatTime', () => {
  it('formats a whole number of minutes with zero-padded seconds', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(60)).toBe('1:00');
    expect(formatTime(1500)).toBe('25:00');
  });

  it('zero-pads seconds below ten', () => {
    expect(formatTime(5)).toBe('0:05');
    expect(formatTime(65)).toBe('1:05');
  });

  it('does not pad seconds at or above ten', () => {
    expect(formatTime(59)).toBe('0:59');
    expect(formatTime(75)).toBe('1:15');
  });

  it('handles durations longer than an hour without a separate hours field', () => {
    expect(formatTime(3661)).toBe('61:01');
  });
});
