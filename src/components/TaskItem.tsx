import type { FC } from "react";
import type { Task } from "../types/task";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTaskStore } from "../store/taskStore";

export interface TaskItemProps {
  task: Task;
  onEditTask: (task: Task) => void;
}

export const TaskItem: FC<TaskItemProps> = ({ task, onEditTask }) => {
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id, data: { type: "Task", task },
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
            {...listeners}
            {...attributes}
            className="bg-white rounded-lg p-4 shadow-sm transition-shadow duration-200 hover:shadow-lg cursor-grab active:cursor-grabbing group relative"
            onClick={() => onEditTask(task)}
        >
            <h3 className="font-semibold text-slate-800">{task.title}</h3>
            {task.description && <p className="text-sm text-slate-600 my-2">{task.description}</p>}

            <button
                onClick={(e) => {
                    e.stopPropagation(); // Предотвращаем открытие модального окна при удалении
                    deleteTask(task.id);
                }}
                className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Удалить задачу"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </div>
    );
};

