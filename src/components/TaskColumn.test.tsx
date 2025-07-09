import { render, screen } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { TaskColumn } from './TaskColumn';
import type { Task } from '../types/task';
import '@testing-library/jest-dom';

// Мокаем TaskItem, так как мы тестируем только TaskColumn
jest.mock('./TaskItem', () => ({
  TaskItem: ({ task }: { task: Task }) => <div data-testid="task-item">{task.title}</div>,
}));

describe('TaskColumn', () => {
  const mockTasks: Task[] = [
    { id: '1', title: 'Task 1', status: 'todo' },
    { id: '2', title: 'Task 2', status: 'todo' },
  ];

  const mockOnTaskClick = jest.fn();

  // Оборачиваем компонент в DndContext, так как он используется внутри
  const renderWithDndContext = (tasks: Task[]) => {
    return render(
      <DndContext onDragEnd={() => {}}>
        <TaskColumn id="todo" title="Нужно сделать" tasks={tasks} onTaskClick={mockOnTaskClick} />
      </DndContext>
    );
  };

  it('should render the column title', () => {
    renderWithDndContext(mockTasks);
    expect(screen.getByRole('heading', { name: /нужно сделать/i })).toBeInTheDocument();
  });

  it('should render all provided tasks', () => {
    renderWithDndContext(mockTasks);
    const taskItems = screen.getAllByTestId('task-item');
    expect(taskItems.length).toBe(2);
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  it('should display a message when there are no tasks', () => {
    renderWithDndContext([]);
    expect(screen.getByText(/задач нет/i)).toBeInTheDocument();
    expect(screen.queryByTestId('task-item')).not.toBeInTheDocument();
  });
});
