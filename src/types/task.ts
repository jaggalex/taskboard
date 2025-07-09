export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
}

export interface TaskState {
  tasks: Task[];
  draggedTask: string | null;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, task: Partial<Omit<Task, 'id'>>) => void;
  deleteTask: (id: string) => void;
  moveTask: (activeId: string, overId: string) => void;
  moveTaskToColumn: (activeId: string, newStatus: TaskStatus) => void;
  setDraggedTask: (id: string | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}
