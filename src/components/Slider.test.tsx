import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { Slider } from './Slider.tsx';

describe('Slider', () => {
  it('renders a range input bound to its value', () => {
    render(<Slider id="alarm-volume" label="Alarm Volume:" value={50} onChange={vi.fn()} />);
    const input = screen.getByLabelText(/Alarm Volume:/);
    expect(input).toHaveAttribute('type', 'range');
    expect(input).toHaveValue('50');
  });

  it('shows the current value by default and hides it when showValue is false', () => {
    const { rerender } = render(
      <Slider id="v" label="Vol:" value={42} onChange={vi.fn()} showValue={true} />
    );
    expect(screen.getByText('42')).toBeInTheDocument();

    rerender(<Slider id="v" label="Vol:" value={42} onChange={vi.fn()} showValue={false} />);
    expect(screen.queryByText('42')).not.toBeInTheDocument();
  });

  it('reports changes as numbers', () => {
    const onChange = vi.fn();
    render(<Slider id="v" label="Vol:" value={50} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText(/Vol:/), { target: { value: '80' } });

    expect(onChange).toHaveBeenCalledWith(80);
  });

  it('computes the fill percentage from a custom min/max range', () => {
    render(<Slider id="v" label="Vol:" value={5} onChange={vi.fn()} min={0} max={10} />);
    const input = screen.getByLabelText(/Vol:/);
    expect(input.style.getPropertyValue('--slider-percentage')).toBe('50%');
  });
});
