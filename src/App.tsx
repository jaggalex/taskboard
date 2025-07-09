import { useState } from 'react';
import type { Task, TaskStatus } from './types/task';
import { TaskColumn } from './components/TaskColumn';
import { DndContext, type DragEndEvent, type DragStartEvent, DragOverlay, closestCorners } from '@dnd-kit/core';
import { TaskItem } from './components/TaskItem';
import { useTaskStore } from './store/taskStore';
import { useTheme } from './hooks/useTheme';
import { TaskModal } from './components/TaskModal';

// Иконки для переключателя темы
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.485-8.485l-.707.707M4.222 4.222l-.707.707M21 12h-1M4 12H3m16.778 4.222l-.707-.707M5.636 18.364l-.707-.707M12 6a6 6 0 100 12 6 6 0 000-12z" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);


function App() {
  const [theme, toggleTheme] = useTheme();
  // Подписываемся на нужные части состояния
  const tasks = useTaskStore((state) => state.tasks);
  const searchTerm = useTaskStore((state) => state.searchTerm);
  const setSearchTerm = useTaskStore((state) => state.setSearchTerm);

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Состояние для управления модальным окном
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Фильтруем задачи на основе поискового запроса
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const todoTasks = filteredTasks.filter(task => task.status === 'todo');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'in-progress');
  const doneTasks = filteredTasks.filter(task => task.status === 'done');


  const handleOpenCreateModal = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    // Получаем свежие задачи из стора в момент начала перетаскивания
    const taskStoreState = useTaskStore.getState();
    const { tasks } = taskStoreState;
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    // Получаем самые свежие данные и функции прямо из стора
    const { tasks, moveTask, moveTaskToColumn } = useTaskStore.getState();
    
    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;

    const isOverATask = over.data.current?.type === 'Task';
    const isOverAColumn = over.data.current?.type === 'Column';

    // Сценарий 1: Перетаскивание на другую ЗАДАЧУ
    if (isOverATask) {
      const overTask = tasks.find(t => t.id === overId);
      if (!overTask) return;

      // 1.1: Внутри одной колонки -> меняем порядок
      if (activeTask.status === overTask.status) {
        moveTask(activeId, overId);
      } 
      // 1.2: В разные колонки -> меняем статус
      else {
        moveTaskToColumn(activeId, overTask.status);
      }
    }
    // Сценарий 2: Перетаскивание на КОЛОНКУ
    else if (isOverAColumn) {
      const newStatus = overId as TaskStatus;
      if (activeTask.status !== newStatus) {
        moveTaskToColumn(activeId, newStatus);
      }
    }
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCorners}
    >
      <main className="p-8 min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors duration-300">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">📋 TaskBoard</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск задач..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 w-64 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
              />
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition-colors"
            >
              + Создать задачу
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Переключить тему"
            >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
          </div>
        </div>
        <div className="flex space-x-8 justify-center items-start mt-4">
          <TaskColumn id="todo" title="Нужно сделать" tasks={todoTasks} onTaskClick={handleOpenEditModal} />
          <TaskColumn id="in-progress" title="В процессе" tasks={inProgressTasks} onTaskClick={handleOpenEditModal} />
          <TaskColumn id="done" title="Готово" tasks={doneTasks} onTaskClick={handleOpenEditModal} />
        </div>
      </main>

      <DragOverlay>
        {activeTask ? <TaskItem task={activeTask} onClick={() => { }} /> : null}
      </DragOverlay>

      {isModalOpen && <TaskModal task={selectedTask} onClose={handleCloseModal} />}
    </DndContext>
  );
}

export default App;
