import { render, screen } from '../test-utils'; // Исправлен путь
import { TaskColumn } from './TaskColumn';
import type { Task as ApiTask } from '../api';
import '@testing-library/jest-dom';

// Мокаем TaskItem, так как мы тестируем только TaskColumn
jest.mock('./TaskItem', () => ({
  TaskItem: ({ task }: { task: ApiTask }) => <div data-testid="task-item">{task.title}</div>,
}));

describe('TaskColumn', () => {
  const mockTasks: ApiTask[] = [
    { id: '1', title: 'Task 1', description: 'd1', status: 'todo', order: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), userId: 'u1' },
    { id: '2', title: 'Task 2', description: 'd2', status: 'todo', order: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), userId: 'u1' },
  ];

  const mockOnTaskEdit = jest.fn();
  const mockOnTaskDelete = jest.fn();

  it('should render the column title', () => {
    render(<TaskColumn id="todo" title="Нужно сделать" tasks={mockTasks} onTaskEdit={mockOnTaskEdit} onTaskDelete={mockOnTaskDelete} />);
    expect(screen.getByRole('heading', { name: /нужно сделать/i })).toBeInTheDocument();
  });

  it('should render all provided tasks', () => {
    render(<TaskColumn id="todo" title="Нужно сделать" tasks={mockTasks} onTaskEdit={mockOnTaskEdit} onTaskDelete={mockOnTaskDelete} />);
    const taskItems = screen.getAllByTestId('task-item');
    expect(taskItems.length).toBe(2);
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  it('should display a message when there are no tasks', () => {
    render(<TaskColumn id="todo" title="Нужно сделать" tasks={[]} onTaskEdit={mockOnTaskEdit} onTaskDelete={mockOnTaskDelete} />);
    expect(screen.getByText(/задач нет/i)).toBeInTheDocument();
    expect(screen.queryByTestId('task-item')).not.toBeInTheDocument();
  });
});
