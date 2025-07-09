import type { FC } from 'react';
import type { Task } from '../types/task';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
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
    };

    const containerClasses = `
        bg-white dark:bg-slate-700 
        rounded-lg p-4 shadow-sm 
        transition-shadow duration-200 group relative
        ${isDragging ? 'opacity-70 shadow-2xl' : ''}
    `;

    return (
        <motion.div
            layoutId={task.id} // <-- Вот ключ к решению!
            ref={setNodeRef}
            style={style}
            className={containerClasses}
        >
            <div {...listeners} {...attributes} onClick={() => onClick(task)} className="cursor-grab active:cursor-grabbing">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">{task.title}</h3>
                {task.description && <p className="text-sm text-slate-600 dark:text-slate-300 my-2">{task.description}</p>}
            </div>
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                }}
                className="absolute top-2 right-2 p-1 rounded-full bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-300 opacity-0 group-hover:opacity-100 hover:bg-red-200 dark:hover:bg-red-500/50 hover:text-red-700 dark:hover:text-red-100 transition-all"
                title="Удалить задачу"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </motion.div>
    );
};

