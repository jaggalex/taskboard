import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DndContext, type DragEndEvent, type DragStartEvent, DragOverlay, closestCorners } from '@dnd-kit/core';
import { useNavigate } from 'react-router-dom';

import { TaskColumn } from '../components/TaskColumn';
import { TaskItem } from '../components/TaskItem';
import { TaskModal } from '../components/TaskModal';
import { useTaskStore } from '../store/taskStore';
import { useTheme } from '../hooks/useTheme';
import * as api from '../api';
import type { Task, TaskStatus } from '../types/task';

// Иконки (остаются без изменений)
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.485-8.485l-.707.707M4.222 4.222l-.707.707M21 12h-1M4 12H3m16.778 4.222l-.707-.707M5.636 18.364l-.707-.707M12 6a6 6 0 100 12 6 6 0 000-12z" /></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;

function TaskboardPage() {
  const [theme, toggleTheme] = useTheme();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Zustand теперь используется только для UI-состояния, не для данных
  const searchTerm = useTaskStore((state) => state.searchTerm);
  const setSearchTerm = useTaskStore((state) => state.setSearchTerm);
  const userLogout = useTaskStore((state) => state.logout);

  const [activeTask, setActiveTask] = useState<api.Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<api.Task | null>(null);

  // 1. Загрузка данных с помощью useQuery
  const { data: tasks = [], isLoading, isError } = useQuery({
    queryKey: ['tasks'],
    queryFn: api.getTasks,
  });

  // 2. Мутации для изменения данных
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: api.UpdateTaskPayload }) => api.updateTask(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: api.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: api.logout,
    onSuccess: () => {
      userLogout();
      queryClient.clear(); // Очищаем весь кэш react-query
      navigate('/login');
    },
  });

  // 3. Фильтрация и распределение задач
  const filteredTasks = useMemo(() => tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ), [tasks, searchTerm]);

  const todoTasks = useMemo(() => filteredTasks.filter(task => task.status === 'todo'), [filteredTasks]);
  const inProgressTasks = useMemo(() => filteredTasks.filter(task => task.status === 'in_progress'), [filteredTasks]);
  const doneTasks = useMemo(() => filteredTasks.filter(task => task.status === 'done'), [filteredTasks]);

  // 4. Обработчики событий
  const handleOpenCreateModal = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: api.Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    
    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;

    const isOverAColumn = over.data.current?.type === 'Column';
    const overTask = isOverAColumn ? undefined : tasks.find(t => t.id === overId);
    
    const newStatus = isOverAColumn ? (overId as TaskStatus) : overTask?.status;
    if (!newStatus) return;

    const tasksInNewColumn = tasks.filter(t => t.status === newStatus && t.id !== activeId);
    
    let newOrder: number;

    if (isOverAColumn) {
      // Перетаскивание в пустую колонку или в конец непустой
      const maxOrder = Math.max(0, ...tasksInNewColumn.map(t => t.order));
      newOrder = maxOrder + 1;
    } else {
      // Перетаскивание на другую задачу
      const overIndex = tasksInNewColumn.findIndex(t => t.id === overId);
      const orderBefore = overIndex > 0 ? tasksInNewColumn[overIndex - 1].order : 0;
      const orderAfter = tasksInNewColumn[overIndex].order;
      newOrder = (orderBefore + orderAfter) / 2;
    }

    updateTaskMutation.mutate({
      id: activeId,
      payload: { status: newStatus, order: newOrder },
    });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Загрузка...</div>;
  }

  if (isError) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">Ошибка загрузки данных!</div>;
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
      <main className="p-8 min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors duration-300">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">📋 TaskBoard</h1>
          <div className="flex items-center space-x-4">
            <input type="text" placeholder="Поиск задач..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="px-4 py-2 w-64 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100" />
            <button onClick={handleOpenCreateModal} className="px-5 py-2.5 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition-colors">+ Создать задачу</button>
            <button onClick={toggleTheme} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Переключить тему"><MoonIcon /></button>
            <button 
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition-colors disabled:bg-red-400"
            >
              Выход
            </button>
          </div>
        </div>
        <div className="flex space-x-8 justify-center items-start mt-4">
          <TaskColumn id="todo" title="Нужно сделать" tasks={todoTasks} onTaskClick={handleOpenEditModal} onTaskDelete={deleteTaskMutation.mutate} />
          <TaskColumn id="in_progress" title="В процессе" tasks={inProgressTasks} onTaskClick={handleOpenEditModal} onTaskDelete={deleteTaskMutation.mutate} />
          <TaskColumn id="done" title="Готово" tasks={doneTasks} onTaskClick={handleOpenEditModal} onTaskDelete={deleteTaskMutation.mutate} />
        </div>
      </main>
      <DragOverlay>{activeTask ? <TaskItem task={activeTask} onClick={() => {}} /> : null}</DragOverlay>
      {isModalOpen && <TaskModal task={selectedTask} onClose={handleCloseModal} />}
    </DndContext>
  );
}

export default TaskboardPage;