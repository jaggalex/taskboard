// Используем нашу кастомную функцию render и другие утилиты
import { render, screen, fireEvent, waitFor } from '../../test-utils'; 
import { TaskModal } from './TaskModal';
import * as api from '../api';
import '@testing-library/jest-dom';

// Мокаем весь модуль api
jest.mock('../api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('TaskModal', () => {
  const mockOnClose = jest.fn();
  const mockTask: api.Task = {
    id: '1',
    title: 'Existing Task',
    description: 'Existing Description',
    status: 'in_progress',
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnClose.mockClear();
  });

  it('should render in create mode and call createTask on submit', async () => {
    mockedApi.createTask.mockResolvedValue(mockTask);

    // Используем нашу новую функцию render
    render(<TaskModal onClose={mockOnClose} />);

    fireEvent.change(screen.getByLabelText(/заголовок/i), { target: { value: 'New Task Title' } });
    fireEvent.change(screen.getByLabelText(/описание/i), { target: { value: 'New Description' } });
    fireEvent.click(screen.getByRole('button', { name: /создать/i }));

    await waitFor(() => {
      expect(mockedApi.createTask).toHaveBeenCalledTimes(1);
      expect(mockedApi.createTask).toHaveBeenCalledWith({
        title: 'New Task Title',
        description: 'New Description',
        status: 'todo',
      });
    });

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('should render in edit mode and call updateTask on submit', async () => {
    mockedApi.updateTask.mockResolvedValue(mockTask);

    render(<TaskModal task={mockTask} onClose={mockOnClose} />);

    expect(screen.getByLabelText(/заголовок/i)).toHaveValue(mockTask.title);

    fireEvent.change(screen.getByLabelText(/заголовок/i), { target: { value: 'Updated Title' } });
    fireEvent.click(screen.getByRole('button', { name: /сохранить/i }));

    await waitFor(() => {
      expect(mockedApi.updateTask).toHaveBeenCalledTimes(1);
      expect(mockedApi.updateTask).toHaveBeenCalledWith(mockTask.id, {
        title: 'Updated Title',
        description: mockTask.description,
        status: mockTask.status,
      });
    });
    
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
});
