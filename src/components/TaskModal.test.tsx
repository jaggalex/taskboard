import { render, screen, fireEvent } from '@testing-library/react';
import { TaskModal } from './TaskModal';
import { useTaskStore } from '../store/taskStore';
import type { Task } from '../types/task';
import '@testing-library/jest-dom';

// Мокаем стор
jest.mock('../store/taskStore');
const mockedUseTaskStore = useTaskStore as unknown as jest.Mock;

const mockAddTask = jest.fn();
const mockUpdateTask = jest.fn();

describe('TaskModal', () => {
  const mockOnClose = jest.fn();
  const mockTask: Task = {
    id: '1',
    title: 'Existing Task',
    description: 'Existing Description',
    status: 'in-progress',
  };

  beforeEach(() => {
    // Сбрасываем моки
    mockAddTask.mockClear();
    mockUpdateTask.mockClear();
    mockOnClose.mockClear();

    // Настраиваем мок стора для работы с селекторами
    mockedUseTaskStore.mockImplementation((selector) => {
      const state = {
        addTask: mockAddTask,
        updateTask: mockUpdateTask,
      };
      // Имитируем выбор нужной функции из стора
      if (selector.toString().includes('addTask')) return state.addTask;
      if (selector.toString().includes('updateTask')) return state.updateTask;
      return state;
    });
  });

  it('should render in create mode with empty fields', () => {
    render(<TaskModal onClose={mockOnClose} />);

    expect(screen.getByRole('heading', { name: /создать задачу/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/заголовок/i)).toHaveValue('');
    expect(screen.getByLabelText(/описание/i)).toHaveValue('');
    expect(screen.getByLabelText(/статус/i)).toHaveValue('todo');
  });

  it('should render in edit mode with populated fields', () => {
    render(<TaskModal task={mockTask} onClose={mockOnClose} />);

    expect(screen.getByRole('heading', { name: /редактировать задачу/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/заголовок/i)).toHaveValue(mockTask.title);
    expect(screen.getByLabelText(/описание/i)).toHaveValue(mockTask.description);
    expect(screen.getByLabelText(/статус/i)).toHaveValue(mockTask.status);
  });

  it('should call addTask and onClose when creating a new task', () => {
    render(<TaskModal onClose={mockOnClose} />);

    fireEvent.change(screen.getByLabelText(/заголовок/i), { target: { value: 'New Task' } });
    fireEvent.click(screen.getByRole('button', { name: /создать/i }));

    expect(mockAddTask).toHaveBeenCalledTimes(1);
    expect(mockAddTask).toHaveBeenCalledWith({ title: 'New Task', description: '', status: 'todo' });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call updateTask and onClose when editing a task', () => {
    render(<TaskModal task={mockTask} onClose={mockOnClose} />);

    fireEvent.change(screen.getByLabelText(/заголовок/i), { target: { value: 'Updated Task' } });
    fireEvent.click(screen.getByRole('button', { name: /сохранить/i }));

    expect(mockUpdateTask).toHaveBeenCalledTimes(1);
    expect(mockUpdateTask).toHaveBeenCalledWith(mockTask.id, { title: 'Updated Task', description: mockTask.description, status: mockTask.status });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when the cancel button is clicked', () => {
    render(<TaskModal onClose={mockOnClose} />);
    fireEvent.click(screen.getByRole('button', { name: /отмена/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
