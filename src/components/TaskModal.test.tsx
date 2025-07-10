import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TaskModal } from './TaskModal';
import * as api from '../api';
import '@testing-library/jest-dom';

// 1. Мокаем весь модуль api
jest.mock('../api');

// Приводим замоканный модуль к типу, чтобы TypeScript не ругался
const mockedApi = api as jest.Mocked<typeof api>;

// 2. Создаем обертку для рендера с QueryClientProvider
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Отключаем повторные попытки в тестах
    },
  },
});

const renderWithClient = (ui: React.ReactElement) => {
  const testQueryClient = createTestQueryClient();
  const { rerender, ...result } = render(
    <QueryClientProvider client={testQueryClient}>{ui}</QueryClientProvider>
  );
  return {
    ...result,
    rerender: (rerenderUi: React.ReactElement) =>
      rerender(
        <QueryClientProvider client={testQueryClient}>{rerenderUi}</QueryClientProvider>
      ),
  };
};


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
    // Сбрасываем все моки перед каждым тестом
    jest.clearAllMocks();
    mockOnClose.mockClear();
  });

  it('should render in create mode and call createTask on submit', async () => {
    // Настраиваем мок-ответ от API
    mockedApi.createTask.mockResolvedValue(mockTask);

    renderWithClient(<TaskModal onClose={mockOnClose} />);

    fireEvent.change(screen.getByLabelText(/заголовок/i), { target: { value: 'New Task Title' } });
    fireEvent.change(screen.getByLabelText(/описание/i), { target: { value: 'New Description' } });
    fireEvent.click(screen.getByRole('button', { name: /создать/i }));

    // Проверяем, что наша API-функция была вызвана с правильными данными
    await waitFor(() => {
      expect(mockedApi.createTask).toHaveBeenCalledTimes(1);
      expect(mockedApi.createTask).toHaveBeenCalledWith({
        title: 'New Task Title',
        description: 'New Description',
        status: 'todo',
      });
    });

    // Проверяем, что модальное окно закрылось после успешного вызова
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('should render in edit mode and call updateTask on submit', async () => {
    mockedApi.updateTask.mockResolvedValue(mockTask);

    renderWithClient(<TaskModal task={mockTask} onClose={mockOnClose} />);

    // Проверяем, что поля заполнены данными из пропса
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