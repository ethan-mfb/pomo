import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useTodos } from './useTodos.ts';

describe('useTodos', () => {
  it('starts with an empty list', () => {
    const { result } = renderHook(() => useTodos());
    expect(result.current.todos).toEqual([]);
  });

  it('adds a todo with trimmed text, not completed (AC1)', () => {
    const { result } = renderHook(() => useTodos());

    act(() => result.current.addTodo('  buy milk  '));

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0]).toMatchObject({ text: 'buy milk', completed: false });
    expect(result.current.todos[0].id).toEqual(expect.any(String));
  });

  it('ignores empty or whitespace-only todos', () => {
    const { result } = renderHook(() => useTodos());

    act(() => result.current.addTodo('   '));
    act(() => result.current.addTodo(''));

    expect(result.current.todos).toEqual([]);
  });

  it('gives each todo a distinct id', () => {
    const { result } = renderHook(() => useTodos());

    act(() => result.current.addTodo('a'));
    act(() => result.current.addTodo('b'));

    const [first, second] = result.current.todos;
    expect(first.id).not.toEqual(second.id);
  });

  it('deletes a todo by id (AC2)', () => {
    const { result } = renderHook(() => useTodos());
    act(() => result.current.addTodo('a'));
    act(() => result.current.addTodo('b'));
    const idToDelete = result.current.todos[0].id;

    act(() => result.current.deleteTodo(idToDelete));

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].text).toBe('b');
  });

  it('toggles a todo between complete and incomplete (AC3)', () => {
    const { result } = renderHook(() => useTodos());
    act(() => result.current.addTodo('a'));
    const id = result.current.todos[0].id;

    act(() => result.current.toggleTodo(id));
    expect(result.current.todos[0].completed).toBe(true);

    act(() => result.current.toggleTodo(id));
    expect(result.current.todos[0].completed).toBe(false);
  });

  it('moves a todo up, and is a no-op for the first item (AC4)', () => {
    const { result } = renderHook(() => useTodos());
    act(() => result.current.addTodo('a'));
    act(() => result.current.addTodo('b'));
    act(() => result.current.addTodo('c'));

    const bId = result.current.todos[1].id;
    act(() => result.current.moveTodoUp(bId));
    expect(result.current.todos.map((t) => t.text)).toEqual(['b', 'a', 'c']);

    // Now 'b' is first; moving it up again does nothing.
    act(() => result.current.moveTodoUp(bId));
    expect(result.current.todos.map((t) => t.text)).toEqual(['b', 'a', 'c']);
  });

  it('moves a todo down, and is a no-op for the last item (AC4)', () => {
    const { result } = renderHook(() => useTodos());
    act(() => result.current.addTodo('a'));
    act(() => result.current.addTodo('b'));
    act(() => result.current.addTodo('c'));

    const bId = result.current.todos[1].id;
    act(() => result.current.moveTodoDown(bId));
    expect(result.current.todos.map((t) => t.text)).toEqual(['a', 'c', 'b']);

    // Now 'b' is last; moving it down again does nothing.
    act(() => result.current.moveTodoDown(bId));
    expect(result.current.todos.map((t) => t.text)).toEqual(['a', 'c', 'b']);
  });
});
