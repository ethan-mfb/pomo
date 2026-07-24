import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toggle } from './Toggle.tsx';

describe('Toggle', () => {
  it('reflects the checked state', () => {
    render(<Toggle id="alarm-toggle" label="Alarm" checked={true} onChange={vi.fn()} />);
    expect(screen.getByRole('checkbox', { name: 'Alarm' })).toBeChecked();
  });

  it('reports the new boolean state when toggled', async () => {
    const onChange = vi.fn();
    render(<Toggle id="alarm-toggle" label="Alarm" checked={false} onChange={onChange} />);

    await userEvent.click(screen.getByRole('checkbox', { name: 'Alarm' }));

    expect(onChange).toHaveBeenCalledWith(true);
  });
});
