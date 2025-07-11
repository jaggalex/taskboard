export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface User {
  id: string;
  email: string;
}

export interface TaskState {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  
  user: User | null;
  isAuthenticated: boolean;
  isAuthInitialized: boolean; // <-- Новое свойство
  setUser: (user: User | null) => void;
  logout: () => void;
  setAuthInitialized: (isInitialized: boolean) => void; // <-- Новый метод
}
