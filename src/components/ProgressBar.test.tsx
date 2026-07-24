import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ProgressBar } from './ProgressBar.tsx';

describe('ProgressBar', () => {
  function bar(container: HTMLElement): HTMLElement {
    const el = container.querySelector('.progress-bar');
    if (!(el instanceof HTMLElement)) throw new Error('progress-bar not found');
    return el;
  }

  it('fills proportionally to the time remaining', () => {
    const { container } = render(<ProgressBar timeRemaining={30} totalDuration={60} />);
    expect(bar(container).style.width).toBe('50%');
  });

  it('is full at the start of a session', () => {
    const { container } = render(<ProgressBar timeRemaining={60} totalDuration={60} />);
    expect(bar(container).style.width).toBe('100%');
  });

  it('is empty when finished', () => {
    const { container } = render(<ProgressBar timeRemaining={0} totalDuration={60} />);
    expect(bar(container).style.width).toBe('0%');
  });

  it('avoids dividing by zero when there is no duration', () => {
    const { container } = render(<ProgressBar timeRemaining={0} totalDuration={0} />);
    expect(bar(container).style.width).toBe('0%');
  });
});
