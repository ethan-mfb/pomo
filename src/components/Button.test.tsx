import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button.tsx';

describe('Button', () => {
  it('renders its children', () => {
    render(<Button onClick={vi.fn()}>Go!</Button>);
    expect(screen.getByRole('button', { name: 'Go!' })).toBeInTheDocument();
  });

  it('fires onClick when pressed', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Press</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Press' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies an optional className alongside the base class', () => {
    render(
      <Button onClick={vi.fn()} className="alarm-test-button">
        X
      </Button>
    );
    const button = screen.getByRole('button', { name: 'X' });
    expect(button).toHaveClass('button', 'alarm-test-button');
  });
});
