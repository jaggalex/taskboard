import { render, screen, fireEvent } from '@testing-library/react';
import { TaskItem } from './TaskItem';
import type { Task as ApiTask } from '../api'; // Используем новый тип
import '@testing-library/jest-dom';
import { DndContext } from '@dnd-kit/core'; // DndContext нужен для useSortable

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

  // Обертка для рендера, так как useSortable требует DndContext
  const renderWithDndContext = (task: ApiTask) => {
    return render(
      <DndContext onDragEnd={() => {}}>
        <TaskItem task={task} onClick={mockOnClick} onDelete={mockOnDelete} />
      </DndContext>
    );
  };

  beforeEach(() => {
    mockOnClick.mockClear();
    mockOnDelete.mockClear();
  });

  it('should render the task title and description', () => {
    renderWithDndContext(mockTask);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should call onClick when the main area is clicked', () => {
    renderWithDndContext(mockTask);
    
    // Кликаем на элемент с текстом, чтобы имитировать клик по основной области
    fireEvent.click(screen.getByText('Test Task'));
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith(mockTask);
  });

  it('should call onDelete with the task id when the delete button is clicked', () => {
    renderWithDndContext(mockTask);
    
    const deleteButton = screen.getByTitle(/удалить задачу/i);
    fireEvent.click(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith(mockTask.id);
    
    // Убедимся, что клик по кнопке не триггерит onClick основной области
    expect(mockOnClick).not.toHaveBeenCalled();
  });
});