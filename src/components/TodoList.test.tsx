import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoList } from './TodoList.tsx';
import type { Todo } from '../types.ts';

const todos: Todo[] = [
  { id: '1', text: 'first', completed: false },
  { id: '2', text: 'second', completed: true },
  { id: '3', text: 'third', completed: false },
];

function noopProps() {
  return {
    todos,
    onAdd: vi.fn(),
    onDelete: vi.fn(),
    onToggle: vi.fn(),
    onMoveUp: vi.fn(),
    onMoveDown: vi.fn(),
  };
}

describe('TodoList', () => {
  it('renders each todo with its completion state (AC3)', () => {
    render(<TodoList {...noopProps()} />);

    expect(screen.getByRole('checkbox', { name: 'first' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'second' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'third' })).not.toBeChecked();
  });

  it('adds a todo from the input and clears it (AC1)', async () => {
    const props = noopProps();
    render(<TodoList {...props} />);

    const input = screen.getByLabelText(/add a todo/i);
    await userEvent.type(input, 'buy milk');
    await userEvent.click(screen.getByRole('button', { name: /^add$/i }));

    expect(props.onAdd).toHaveBeenCalledWith('buy milk');
    expect(input).toHaveValue('');
  });

  it('does not add a blank todo', async () => {
    const props = noopProps();
    render(<TodoList {...props} />);

    await userEvent.type(screen.getByLabelText(/add a todo/i), '   ');
    await userEvent.click(screen.getByRole('button', { name: /^add$/i }));

    expect(props.onAdd).not.toHaveBeenCalled();
  });

  it('deletes a todo (AC2)', async () => {
    const props = noopProps();
    render(<TodoList {...props} />);

    await userEvent.click(screen.getByRole('button', { name: /delete first/i }));

    expect(props.onDelete).toHaveBeenCalledWith('1');
  });

  it('toggles a todo (AC3)', async () => {
    const props = noopProps();
    render(<TodoList {...props} />);

    await userEvent.click(screen.getByRole('checkbox', { name: 'first' }));

    expect(props.onToggle).toHaveBeenCalledWith('1');
  });

  it('reorders todos with move up / move down, disabled at the ends (AC4)', async () => {
    const props = noopProps();
    render(<TodoList {...props} />);

    // First item cannot move up; last item cannot move down.
    expect(screen.getByRole('button', { name: /move first up/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /move third down/i })).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: /move second up/i }));
    expect(props.onMoveUp).toHaveBeenCalledWith('2');

    await userEvent.click(screen.getByRole('button', { name: /move second down/i }));
    expect(props.onMoveDown).toHaveBeenCalledWith('2');
  });
});
