import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import type {Task, TaskStatus} from '../types/task';
import {v4 as uuidv4} from 'uuid';
import {arrayMove} from '@dnd-kit/sortable';

const initialTasks: Task[] = [];

interface TaskState {
  tasks: Task[];
  addTask: (title: string, description?: string, status?: TaskStatus) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, title: string, description?: string, status?: TaskStatus) => void;
  moveTask: (activeId: string, overId: string) => void;
  moveTaskToColumn: (activeId: string, overStatus: TaskStatus) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: initialTasks,
      addTask: (title, description = '', status = 'todo') => {
        const newTask: Task = {
          id: uuidv4(),
          title,
          description,
          status,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({tasks: [...state.tasks, newTask]}));
      },
      deleteTask: (id) => {
        set((state) => ({tasks: state.tasks.filter((task) => task.id !== id)}));
      },
      updateTask: (id, title, description = '', status = 'todo') => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {...task, title, description, status, updatedAt: new Date()}
              : task
          ),
        }));
      },
      moveTask: (activeId, overId) => {
        set((state) => {
          const activeIndex = state.tasks.findIndex((t) => t.id === activeId);
          const overIndex = state.tasks.findIndex((t) => t.id === overId);
          if (state.tasks[activeIndex].status === state.tasks[overIndex].status) {
            return { tasks: arrayMove(state.tasks, activeIndex, overIndex) };
          }
          return state;
        });
      },

      moveTaskToColumn: (activeId, overStatus) => {
        set((state) => {
          const activeIndex = state.tasks.findIndex((t) => t.id === activeId);
          if (state.tasks[activeIndex].status !== overStatus) {
            const newTasks = [ ...state.tasks ];
            newTasks[activeIndex] = { ...newTasks[activeIndex], status: overStatus};
            return { tasks: newTasks};
          }
          return state;
        });
      },
    }),
    {
      name: 'task-board-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);