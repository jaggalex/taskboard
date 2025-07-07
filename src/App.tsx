import { useState } from 'react';
import type { Task, TaskStatus } from './types/task';
import { TaskColumn } from './components/TaskColumn';
import { DndContext, type DragEndEvent, type DragStartEvent, DragOverlay, closestCorners } from '@dnd-kit/core';
import { TaskItem } from './components/TaskItem';
import { useTaskStore } from './store/taskStore';
import { TaskModal } from './components/TaskModal';

function App() {
  const tasks = useTaskStore((state) => state.tasks);
  const moveTask = useTaskStore((state) => state.moveTask);
  const moveTaskToColumn = useTaskStore((state) => state.moveTaskToColumn);
  
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Состояние для управления модальным окном
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const todoTasks = tasks.filter(task => task.status === 'todo');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const doneTasks = tasks.filter(task => task.status === 'done');

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
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;

    if (!over) return;
    if (active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    // Сценарий 1: Сортировка внутри одной колонки
    if (isActiveTask && isOverTask) {
      moveTask(activeId, overId);
    }

    // Сценарий 2: Перемещение в другую колонку
    if (isActiveTask && (isOverTask || isOverColumn)) {
      let overStatus: TaskStatus;

      if (isOverTask) {
        overStatus = tasks.find(t => t.id === overId)!.status;
      } else { // isOverColumn
        overStatus = over.data.current!.id;
      }
      
      moveTaskToColumn(activeId, overStatus);
    }
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCorners}
    >
      <main className="p-8 min-h-screen bg-slate-100">
        <div className="flex justify-between items-center mb-10">
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">📋 TaskBoard</h1>
            <button 
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition-colors"
            >
              + Создать задачу
            </button>
        </div>
        <div className="flex space-x-8 justify-center items-start mt-4">
          <TaskColumn id="todo" title="Нужно сделать" tasks={todoTasks} onTaskClick={handleOpenEditModal} />
          <TaskColumn id="in-progress" title="В процессе" tasks={inProgressTasks} onTaskClick={handleOpenEditModal} />
          <TaskColumn id="done" title="Готово" tasks={doneTasks} onTaskClick={handleOpenEditModal} />
        </div>
      </main>

      <DragOverlay>
        {activeTask ? <TaskItem task={activeTask} onClick={() => {}} /> : null}
      </DragOverlay>

      {isModalOpen && <TaskModal task={selectedTask} onClose={handleCloseModal} />}
    </DndContext>
  );
}

export default App;
