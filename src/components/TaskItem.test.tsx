import { render, screen, fireEvent } from '../../test-utils'; // Используем кастомный рендер
import { TaskItem } from './TaskItem';
import type { Task as ApiTask } from '../api';
import '@testing-library/jest-dom';
// DndContext больше не нужен здесь, так как он в нашей обертке

describe('TaskItem', () => {
  const mockTask: ApiTask = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'todo',
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockOnClick = jest.fn();
  const mockOnDelete = jest.fn();

  // Удаляем старую обертку
  // const renderWithDndContext = ...

  beforeEach(() => {
    mockOnClick.mockClear();
    mockOnDelete.mockClear();
  });

  it('should render the task title and description', () => {
    render(<TaskItem task={mockTask} onClick={mockOnClick} onDelete={mockOnDelete} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should call onClick when the main area is clicked', () => {
    render(<TaskItem task={mockTask} onClick={mockOnClick} onDelete={mockOnDelete} />);
    
    fireEvent.click(screen.getByText('Test Task'));
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith(mockTask);
  });

  it('should call onDelete with the task id when the delete button is clicked', () => {
    render(<TaskItem task={mockTask} onClick={mockOnClick} onDelete={mockOnDelete} />);
    
    const deleteButton = screen.getByTitle(/удалить задачу/i);
    fireEvent.click(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith(mockTask.id);
    
    expect(mockOnClick).not.toHaveBeenCalled();
  });
});
