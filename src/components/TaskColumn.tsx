import type { FC } from 'react';
import type { Task, TaskStatus } from '../types/task';
import { TaskItem } from './TaskItem';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface TaskColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export const TaskColumn: FC<TaskColumnProps> = ({ id, title, tasks, onTaskClick }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: 'Column',
      id,
    },
  });

  const style = {
    backgroundColor: isOver ? 'rgba(2, 132, 199, 0.1)' : '#f1f5f9', // bg-slate-100 with sky-600 overlay
    transition: 'background-color 0.2s ease-in-out',
    boxShadow: isOver ? '0 4px 12px 0 rgba(0, 0, 0, 0.1)' : 'none',
  };

  const taskIds = tasks.map(task => task.id);

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl p-4 w-80 flex-shrink-0 shadow-sm bg-slate-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-700">{title}</h2>
        <span className="text-sm font-semibold text-slate-500 bg-slate-300/50 px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {tasks.map(task => (
            <TaskItem key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};
