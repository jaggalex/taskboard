import axios from 'axios';
import type { Task as TaskFromStore } from './types/task';

// Определяем тип Task так, как он приходит с бэкенда (с полем order)
export interface Task extends Omit<TaskFromStore, 'status'> {
  order: number;
  status: string; // На бэкенде это enum, но на фронт приходит как string
  createdAt: string;
  updatedAt: string;
}

const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api',
  withCredentials: true, // <-- Вот эта строка
});

export const getTasks = async (): Promise<Task[]> => {
  const response = await apiClient.get('/tasks');
  return response.data;
};

// Тип для создания задачи (без id, order, createdAt, updatedAt)
export type CreateTaskPayload = Omit<Task, 'id' | 'order' | 'createdAt' | 'updatedAt'>;

export const createTask = async (task: CreateTaskPayload): Promise<Task> => {
  const response = await apiClient.post('/tasks', task);
  return response.data;
};

// Тип для обновления задачи (все поля опциональны)
export type UpdateTaskPayload = Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>;

export const updateTask = async (id: string, task: UpdateTaskPayload): Promise<Task> => {
  const response = await apiClient.put(`/tasks/${id}`, task);
  return response.data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await apiClient.delete(`/tasks/${id}`);
};

// --- Функции для аутентификации ---

export type RegisterPayload = {
  email: string;
  password: string
}
export const register = async (payload: RegisterPayload) => {
  return apiClient.post('/auth/register', payload);
}

export type LoginPayload = RegisterPayload;
export const login = async (payload: LoginPayload) => {
  return apiClient.post('/auth/login', payload);
}

export const logout = async () => {
  return apiClient.post('/auth/logout');
}

export const getMe = async () => {
  return apiClient.get('/auth/me');
}
