import { act, renderHook } from '@testing-library/react';
import { useTaskStore } from './taskStore';

// Мокаем uuid
jest.mock('uuid', () => ({
  v4: () => 'test-id-' + Math.random(),
}));

describe('taskStore', () => {
  beforeEach(() => {
    // Сбрасываем состояние перед каждым тестом
    act(() => {
      const store = useTaskStore.getState();
      store.tasks = [];
      store.draggedTask = null;
    });
  });

  it('should add a task', () => {
    const { result } = renderHook(() => useTaskStore());

    act(() => {
      result.current.addTask({ title: 'New Task', description: 'Description', status: 'todo' });
    });

    expect(result.current.tasks.length).toBe(1);
    expect(result.current.tasks[0].title).toBe('New Task');
    expect(result.current.tasks[0].id).toBeDefined();
  });

  it('should delete a task', () => {
    const { result } = renderHook(() => useTaskStore());

    act(() => {
      result.current.addTask({ title: 'Task to delete', description: '', status: 'todo' });
    });

    const taskId = result.current.tasks[0].id;

    act(() => {
      result.current.deleteTask(taskId);
    });

    expect(result.current.tasks.length).toBe(0);
  });

  it('should update a task', () => {
    const { result } = renderHook(() => useTaskStore());

    act(() => {
      result.current.addTask({ title: 'Old Title', description: 'Old Desc', status: 'todo' });
    });

    const taskId = result.current.tasks[0].id;

    act(() => {
      result.current.updateTask(taskId, { title: 'New Title' });
    });

    expect(result.current.tasks[0].title).toBe('New Title');
    expect(result.current.tasks[0].description).toBe('Old Desc');
  });

  it('should move a task to a different column', () => {
    const { result } = renderHook(() => useTaskStore());

    // Добавляем две задачи в разные колонки
    act(() => {
      result.current.addTask({ title: 'Task 1', status: 'todo' });
      result.current.addTask({ title: 'Task 2', status: 'in-progress' });
    });

    const task1Id = result.current.tasks.find(t => t.title === 'Task 1')!.id;
    const task2Id = result.current.tasks.find(t => t.title === 'Task 2')!.id;

    // Симулируем перетаскивание Task 1 на место Task 2
    act(() => {
      result.current.setDraggedTask(task1Id);
      result.current.moveTask(task1Id, task2Id);
    });

    const movedTask = result.current.tasks.find(t => t.id === task1Id);
    expect(movedTask?.status).toBe('in-progress');
  });

  it('should move a task within the same column', () => {
    const { result } = renderHook(() => useTaskStore());

    act(() => {
      result.current.addTask({ title: 'Task 1', status: 'todo' });
      result.current.addTask({ title: 'Task 2', status: 'todo' });
      result.current.addTask({ title: 'Task 3', status: 'todo' });
    });

    const task1Id = result.current.tasks.find(t => t.title === 'Task 1')!.id;
    const task3Id = result.current.tasks.find(t => t.title === 'Task 3')!.id;

    expect(result.current.tasks.map(t => t.title)).toEqual(['Task 1', 'Task 2', 'Task 3']);

    // Перемещаем Task 3 на место Task 1
    act(() => {
      result.current.moveTask(task3Id, task1Id);
    });

    expect(result.current.tasks.map(t => t.title)).toEqual(['Task 3', 'Task 1', 'Task 2']);
  });
});

