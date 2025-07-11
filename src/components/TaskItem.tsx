import type { FC } from 'react';
import type { Task } from '../api'; // Используем новый тип
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';

interface TaskItemProps {
    task: Task;
    onEdit: (task: Task) => void; // Переименовано из onClick для ясности
    onDelete: (id: string) => void;
}

export const TaskItem: FC<TaskItemProps> = ({ task, onEdit, onDelete }) => {
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
            layoutId={task.id}
            ref={setNodeRef}
            style={style}
            className={containerClasses}
            {...attributes} // Переносим атрибуты dnd сюда
        >
            {/* Обертка для перетаскивания */}
            <div {...listeners} className="cursor-grab active:cursor-grabbing w-full">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">{task.title}</h3>
                {task.description && <p className="text-sm text-slate-600 dark:text-slate-300 my-2">{task.description}</p>}
            </div>

            {/* Кнопка Редактировать */}
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onEdit(task);
                }}
                className="absolute top-2 right-10 p-1 rounded-full bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-300 opacity-0 group-hover:opacity-100 hover:bg-blue-200 dark:hover:bg-blue-500/50 hover:text-blue-700 dark:hover:text-blue-100 transition-all"
                title="Редактировать задачу"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" />
                </svg>
            </button>

            {/* Кнопка Удалить */}
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
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

