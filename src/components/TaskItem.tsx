import type { FC } from 'react';
import type { Task } from '../types/task';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTaskStore } from '../store/taskStore';

interface TaskItemProps {
    task: Task;
    onClick: (task: Task) => void;
}

export const TaskItem: FC<TaskItemProps> = ({ task, onClick }) => {
    const deleteTask = useTaskStore((state) => state.deleteTask);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: 'Task',
            task,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition || 'transform 250ms ease',
        opacity: isDragging ? 0.7 : 1,
        boxShadow: isDragging ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white rounded-lg p-4 shadow-sm transition-shadow duration-200 group relative"
        >
            <div {...listeners} {...attributes} onClick={() => onClick(task)} className="cursor-grab active:cursor-grabbing">
                <h3 className="font-semibold text-slate-800">{task.title}</h3>
                {task.description && <p className="text-sm text-slate-600 my-2">{task.description}</p>}
            </div>
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                }}
                className="absolute top-2 right-2 p-1 rounded-full bg-slate-100 text-slate-500 opacity-0 group-hover:opacity-100 hover:bg-red-200 hover:text-red-700 transition-opacity"
                title="Удалить задачу"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

