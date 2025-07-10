import { create } from 'zustand';
import type { TaskState } from '../types/task';

export const useTaskStore = create<TaskState>()((set) => ({
  searchTerm: '',
  setSearchTerm: (term) => set({ searchTerm: term }),
}));