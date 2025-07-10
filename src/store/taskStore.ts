import { create } from 'zustand';
import type { TaskState } from '../types/task';

export const useTaskStore = create<TaskState>()((set) => ({
  // Поиск
  searchTerm: '',
  setSearchTerm: (term) => set({ searchTerm: term }),

  // Аутентификация
  user: null,
  isAuthenticated: false,
  isAuthInitialized: false, // <-- Начальное состояние
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),
  setAuthInitialized: (isInitialized) => set({ isAuthInitialized: isInitialized }),
}));