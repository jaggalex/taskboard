import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Task, TaskState } from '../types/task';
import { v4 as uuidv4 } from 'uuid';
import { arrayMove } from '@dnd-kit/sortable';

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],
      draggedTask: null,
      setDraggedTask: (id) => set({ draggedTask: id }),
      addTask: (task) => {
        const newTask: Task = {
          id: uuidv4(),
          ...task,
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
      },
      deleteTask: (id) => {
        set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) }));
      },
      updateTask: (id, updatedTask) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...updatedTask }
              : task
          ),
        }));
      },
      moveTask: (activeId, overId) => {
        set((state) => {
          const activeIndex = state.tasks.findIndex((t) => t.id === activeId);
          const overIndex = state.tasks.findIndex((t) => t.id === overId);
          
          // Убедимся, что обе задачи найдены и находятся в одной колонке
          if (activeIndex === -1 || overIndex === -1 || state.tasks[activeIndex].status !== state.tasks[overIndex].status) {
            return state;
          }

          return { tasks: arrayMove(state.tasks, activeIndex, overIndex) };
        });
      },
      moveTaskToColumn: (activeId, newStatus) => {
        set((state) => {
          const activeIndex = state.tasks.findIndex((t) => t.id === activeId);
          if (activeIndex === -1) {
            return state;
          }
          
          const newTasks = [...state.tasks];
          newTasks[activeIndex] = { ...newTasks[activeIndex], status: newStatus };
          
          return { tasks: newTasks };
        });
      },
    }),
    {
      name: 'task-board-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
