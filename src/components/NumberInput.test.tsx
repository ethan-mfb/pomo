import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NumberInput } from './NumberInput.tsx';

describe('NumberInput', () => {
  it('renders a labelled numeric input bound to its value', () => {
    render(
      <NumberInput id="work-duration" label="Work Session Duration:" value={25} onChange={vi.fn()} />
    );

    const input = screen.getByLabelText('Work Session Duration:');
    expect(input).toHaveValue(25);
    expect(input).toHaveAttribute('type', 'number');
  });

  it('reports changes as numbers, not strings', async () => {
    const onChange = vi.fn();
    render(<NumberInput id="work-duration" label="Duration:" value={0} onChange={onChange} />);

    await userEvent.type(screen.getByLabelText('Duration:'), '5');

    expect(onChange).toHaveBeenLastCalledWith(5);
    expect(onChange).not.toHaveBeenLastCalledWith('5');
  });

  it('renders the placeholder as a string', () => {
    render(
      <NumberInput
        id="d"
        label="Duration:"
        value={25}
        placeholder={25}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByLabelText('Duration:')).toHaveAttribute('placeholder', '25');
  });
});
