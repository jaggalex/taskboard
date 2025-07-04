import type { FC } from 'react';
import type { Task, TaskStatus } from '../types/task';
import { TaskItem } from './TaskItem';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface TaskColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  onAddTask: (status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
} 

export const TaskColumn: FC<TaskColumnProps> = ({ id, title, tasks, onAddTask, onEditTask}) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: 'Column',
      id,
    },
  });

  const style = {
    backgroundColor: isOver ? 'rgba(10, 18, 21, 0.1)' : '#414649',
    transition: 'background-color 0.2s ease-in-out',
    boxShadow: isOver ? '0 4px 12px 0 rgba(220, 148, 148, 0.1)' : 'none',
  };

  const taskIds = tasks.map(task => task.id);

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl p-4 flex-col h-fit min-h-[500px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{title} ({tasks.length})
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onAddTask(id)}
            className="text-slate-500 hover:text-sky-600 transition-colors"
            title="Добавить задачу"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {tasks.map(task => (
            <TaskItem key={task.id} task={task} onEditTask={onEditTask} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};
