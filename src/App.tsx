import { useState } from 'react';
import type { Task, TaskStatus } from './types/task';
import { TaskColumn } from './components/TaskColumn';
import { DndContext, type DragEndEvent, type DragStartEvent, DragOverlay, closestCorners } from '@dnd-kit/core';
import { TaskItem } from './components/TaskItem';
import { useTaskStore } from './store/taskStore';
import { TaskModal } from './components/TaskModal';
// import TodoItem from './components/TodoItem';

function App() {
  const tasks = useTaskStore((state) => state.tasks);
  const moveTask = useTaskStore((state) => state.moveTask);
  const moveTaskToColumn = useTaskStore((state) => state.moveTaskToColumn);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [initialStatus, setInitialStatus] = useState<TaskStatus | undefined>(undefined);

  const todoTasks = tasks.filter(task => task.status === 'todo');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const doneTasks = tasks.filter(task => task.status === 'done');

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;

    if (!over) return;

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

  const openCreateModal = (status: TaskStatus) => {
    console.log('Opening create modal for status:', status);
    setEditingTask(null);
    setInitialStatus(status);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setInitialStatus(task.status);
    setIsModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setInitialStatus(undefined);
  };

  return (
    <>
      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCorners}
      >
        <main className="p-8 min-h-screen">
          <h1 className="text-4xl font-extrabold mb-10 text-center tracking-tight">📋 TaskBoard</h1>
          <div className="flex flex-row flex-nowrap gap-2 overflow-x-auto content-center">
            <TaskColumn id="todo" title="Нужно сделать" tasks={todoTasks} onAddTask={openCreateModal} onEditTask={openEditModal} />
            <TaskColumn id="in-progress" title="В процессе" tasks={inProgressTasks} onAddTask={openCreateModal} onEditTask={openEditModal} />
            <TaskColumn id="done" title="Готово" tasks={doneTasks} onAddTask={openCreateModal} onEditTask={openEditModal} />
          </div>
        </main>

        <DragOverlay>
          {activeTask ? <TaskItem task={activeTask} onEditTask={openEditModal} /> : null}
        </DragOverlay>

        {isModalOpen && (
          <TaskModal
            task={editingTask}
            onClose={closeTaskModal}
          />
        )}
      </DndContext>
    </>
  );
}

export default App;
