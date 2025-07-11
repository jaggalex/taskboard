import { render, screen, fireEvent } from '../test-utils';
import { TaskItem } from './TaskItem';
import type { Task as ApiTask } from '../api';
import '@testing-library/jest-dom';

describe('TaskItem', () => {
  const mockTask: ApiTask = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'todo',
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: 'user-1',
  };

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    mockOnEdit.mockClear();
    mockOnDelete.mockClear();
  });

  it('should render the task title and description', () => {
    render(<TaskItem task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should not call onEdit when the main area is clicked', () => {
    render(<TaskItem task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    fireEvent.click(screen.getByText('Test Task'));
    expect(mockOnEdit).not.toHaveBeenCalled();
  });

  it('should call onEdit when the edit button is clicked', () => {
    render(<TaskItem task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    const editButton = screen.getByTitle(/редактировать задачу/i);
    fireEvent.click(editButton);
    
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
  });

  it('should call onDelete with the task id when the delete button is clicked', () => {
    render(<TaskItem task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    const deleteButton = screen.getByTitle(/удалить задачу/i);
    fireEvent.click(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith(mockTask.id);
    
    expect(mockOnEdit).not.toHaveBeenCalled();
  });
});
