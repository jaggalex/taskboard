import { render, screen } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { TaskColumn } from './TaskColumn';
import type { Task as ApiTask } from '../api'; // Используем новый тип
import '@testing-library/jest-dom';

// Мокаем TaskItem, так как мы тестируем только TaskColumn
jest.mock('./TaskItem', () => ({
  TaskItem: ({ task }: { task: ApiTask }) => <div data-testid="task-item">{task.title}</div>,
}));

describe('TaskColumn', () => {
  // Обновляем мок-данные, чтобы они соответствовали новому типу ApiTask
  const mockTasks: ApiTask[] = [
    { id: '1', title: 'Task 1', status: 'todo', order: 1, createdAt: '', updatedAt: '' },
    { id: '2', title: 'Task 2', status: 'todo', order: 2, createdAt: '', updatedAt: '' },
  ];

  const mockOnTaskClick = jest.fn();
  const mockOnTaskDelete = jest.fn();

  // Оборачиваем компонент в DndContext, так как он используется внутри
  const renderWithDndContext = (tasks: ApiTask[]) => {
    return render(
      <DndContext onDragEnd={() => {}}>
        <TaskColumn id="todo" title="Нужно сделать" tasks={tasks} onTaskClick={mockOnTaskClick} onTaskDelete={mockOnTaskDelete} />
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
