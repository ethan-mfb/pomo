import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from './ThemeToggle.tsx';

describe('ThemeToggle', () => {
  it('shows the dark-mode glyph when the theme is dark', () => {
    render(<ThemeToggle theme="dark" onToggle={vi.fn()} />);
    expect(screen.getByRole('button', { name: '◐' })).toBeInTheDocument();
  });

  it('shows the light-mode glyph when the theme is light', () => {
    render(<ThemeToggle theme="light" onToggle={vi.fn()} />);
    expect(screen.getByRole('button', { name: '◑' })).toBeInTheDocument();
  });

  it('fires onToggle when clicked', async () => {
    const onToggle = vi.fn();
    render(<ThemeToggle theme="dark" onToggle={onToggle} />);

    await userEvent.click(screen.getByRole('button'));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
