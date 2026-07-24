import { useState } from 'react';
import type { Todo } from '../types.ts';
import './TodoList.scss';

// Presentational icons for the row action buttons. Each button carries its own
// aria-label, so the SVGs are decorative (aria-hidden) and inherit the button's
// text color via `currentColor`.
const iconProps = {
  width: 16,
  height: 16,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
};

function ChevronUpIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 10l4-4 4 4" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

export type TodoListProps = {
  todos: Todo[];
  onAdd: (text: string) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
};

export function TodoList({ todos, onAdd, onDelete, onToggle, onMoveUp, onMoveDown }: TodoListProps) {
  const [draft, setDraft] = useState('');

  const submitDraft = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (trimmed === '') {
      return;
    }
    onAdd(trimmed);
    setDraft('');
  };

  return (
    <section className="todo-list">
      <form className="todo-list-add" onSubmit={submitDraft}>
        <label htmlFor="todo-input">Add a todo</label>{' '}
        <input
          id="todo-input"
          name="todo-input"
          type="text"
          value={draft}
          placeholder="What needs doing?"
          onChange={(e) => setDraft(e.target.value)}
        />
        <button className="button" type="submit">
          Add
        </button>
      </form>

      <ul className="todo-list-items">
        {todos.map((todo, index) => (
          <li
            key={todo.id}
            className={`todo-list-item ${todo.completed ? 'todo-list-item--completed' : ''}`}
          >
            <label className="todo-list-item-label">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => onToggle(todo.id)}
              />
              <span className="todo-list-item-text">{todo.text}</span>
            </label>
            <div className="todo-list-item-actions">
              <button
                className="button"
                type="button"
                aria-label={`Move ${todo.text} up`}
                disabled={index === 0}
                onClick={() => onMoveUp(todo.id)}
              >
                <ChevronUpIcon />
              </button>
              <button
                className="button"
                type="button"
                aria-label={`Move ${todo.text} down`}
                disabled={index === todos.length - 1}
                onClick={() => onMoveDown(todo.id)}
              >
                <ChevronDownIcon />
              </button>
              <button
                className="button"
                type="button"
                aria-label={`Delete ${todo.text}`}
                onClick={() => onDelete(todo.id)}
              >
                <CloseIcon />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
