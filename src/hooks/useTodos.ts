import { useCallback, useState } from 'react';
import type { Todo } from '../types.ts';

/**
 * Owns the todo list and the operations over it. Kept as a hook (rather than
 * inline `App` state) so the list logic stays testable in isolation, matching
 * the engine-in-hooks pattern used by `useTimer`/`useAlarm`.
 */
export function useTodos(): {
  todos: Todo[];
  addTodo: (text: string) => void;
  deleteTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
  moveTodoUp: (id: string) => void;
  moveTodoDown: (id: string) => void;
} {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = useCallback((text: string) => {
    const trimmed = text.trim();
    if (trimmed === '') {
      return;
    }
    setTodos((prev) => [...prev, { id: crypto.randomUUID(), text: trimmed, completed: false }]);
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo))
    );
  }, []);

  // Swap the todo at `index` with the one at `index + offset`, if in range.
  const move = useCallback((id: string, offset: number) => {
    setTodos((prev) => {
      const index = prev.findIndex((todo) => todo.id === id);
      const target = index + offset;
      if (index === -1 || target < 0 || target >= prev.length) {
        return prev;
      }
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, []);

  const moveTodoUp = useCallback((id: string) => move(id, -1), [move]);
  const moveTodoDown = useCallback((id: string) => move(id, 1), [move]);

  return { todos, addTodo, deleteTodo, toggleTodo, moveTodoUp, moveTodoDown };
}
