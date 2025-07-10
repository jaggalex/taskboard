export type TaskStatus = 'todo' | 'in-progress' | 'done';

// Этот тип описывает задачу в том виде, в котором она была до рефакторинга.
// Мы его оставляем, т.к. на него могут ссылаться старые компоненты,
// но для API-взаимодействия используется тип из `src/api.ts`.
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
}

// Состояние Zustand теперь хранит только UI-специфичные вещи
export interface TaskState {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}