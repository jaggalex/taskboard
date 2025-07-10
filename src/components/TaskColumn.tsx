import type { FC } from 'react';
import type { Task as ApiTask } from '../api'; // Используем новый тип
import { TaskItem } from './TaskItem';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface TaskColumnProps {
  id: string;
  title: string;
  tasks: ApiTask[];
  onTaskClick: (task: ApiTask) => void;
  onTaskDelete: (id: string) => void; // Новый пропс
}

export const TaskColumn: FC<TaskColumnProps> = ({ id, title, tasks, onTaskClick, onTaskDelete }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: 'Column',
      id,
    },
  });

  const taskIds = tasks.map(task => task.id);

  return (
    <div 
      ref={setNodeRef} 
      className={`
        rounded-xl p-4 w-80 flex-shrink-0 shadow-sm 
        bg-slate-200 dark:bg-slate-800/50
        transition-colors duration-200 ease-in-out
        ${isOver ? 'bg-sky-200/50 dark:bg-sky-900/50 shadow-lg' : ''}
      `}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">{title}</h2>
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 bg-slate-300/50 dark:bg-slate-700/50 px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {tasks.length > 0 ? (
            tasks.map(task => (
              <TaskItem key={task.id} task={task} onClick={onTaskClick} onDelete={onTaskDelete} />
            ))
          ) : (
            <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-4">
              Задач нет
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};
