import type { FC, FormEvent } from 'react';
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api';
import type { TaskStatus } from '../types/task';
import { useTaskStore } from '../store/taskStore'; // 1. Импортируем стор

interface TaskModalProps {
  task?: api.Task | null;
  onClose: () => void;
}

export const TaskModal: FC<TaskModalProps> = ({ task, onClose }) => {
  const queryClient = useQueryClient();
  const user = useTaskStore((state) => state.user); // 2. Получаем пользователя
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');

  const isEditing = !!task;

  useEffect(() => {
    if (isEditing && task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status as TaskStatus);
    }
  }, [task, isEditing]);

  const createTaskMutation = useMutation({
    mutationFn: api.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onClose();
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: api.UpdateTaskPayload }) => api.updateTask(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onClose();
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (isEditing && task) {
      // В обновлении userId не нужен, так как он не меняется
      updateTaskMutation.mutate({
        id: task.id,
        payload: { title, description, status },
      });
    } else {
      // 3. Добавляем userId при создании
      if (!user) {
        // Можно показать ошибку пользователю
        console.error("Невозможно создать задачу: пользователь не аутентифицирован.");
        return;
      }
      createTaskMutation.mutate({ title, description, status, userId: user.id });
    }
  };
  
  const isSubmitting = createTaskMutation.isPending || updateTaskMutation.isPending;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-70 z-40 flex justify-center items-center"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 text-gray-950 dark:text-slate-100 rounded-lg shadow-xl p-6 w-full max-w-md z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">{isEditing ? 'Редактировать задачу' : 'Создать задачу'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Заголовок</label>
            <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400" placeholder="Например, выпить кофе" required />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Описание (опционально)</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400" rows={4} placeholder="Описать детали задачи..." />
          </div>
          <div className="mb-6">
            <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Статус</label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400">
              <option value="todo">Нужно сделать</option>
              <option value="in_progress">В процессе</option>
              <option value="done">Готово</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors" disabled={isSubmitting}>Отмена</button>
            <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 dark:hover:bg-sky-500 transition-colors disabled:bg-sky-400" disabled={isSubmitting || (!isEditing && !user)}>
              {isSubmitting ? 'Сохранение...' : (isEditing ? 'Сохранить' : 'Создать')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
