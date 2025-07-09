import { render, screen, fireEvent } from '@testing-library/react';
import { TaskItem } from './TaskItem';
import { useTaskStore } from '../store/taskStore';
import type { Task } from '../types/task';
import '@testing-library/jest-dom';

// Мокаем стор Zustand
jest.mock('../store/taskStore');

// Приводим тип через unknown, чтобы TypeScript не ругался
const mockedUseTaskStore = useTaskStore as unknown as jest.Mock;
const mockDeleteTask = jest.fn();

describe('TaskItem', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'todo',
  };

  beforeEach(() => {
    // Сбрасываем моки перед каждым тестом
    mockDeleteTask.mockClear();
    
    // Настраиваем мок стора, чтобы он работал с селекторами
    mockedUseTaskStore.mockImplementation((selector) => {
      const state = {
        deleteTask: mockDeleteTask,
      };
      return selector(state);
    });
  });

  it('should render the task title', () => {
    render(<TaskItem task={mockTask} onClick={() => {}} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('should call onClick when the task item is clicked', () => {
    const handleClick = jest.fn();
    render(<TaskItem task={mockTask} onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Test Task'));
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(mockTask);
  });

  it('should call deleteTask when the delete button is clicked', () => {
    render(<TaskItem task={mockTask} onClick={() => {}} />);
    
    // Находим кнопку по атрибуту title
    const deleteButton = screen.getByTitle(/Удалить задачу/i);
    fireEvent.click(deleteButton);
    
    expect(mockDeleteTask).toHaveBeenCalledTimes(1);
    expect(mockDeleteTask).toHaveBeenCalledWith(mockTask.id);
  });
});
