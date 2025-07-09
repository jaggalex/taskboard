import React from 'react';

interface TodoItemProps {
  id: string;
  text: string;
  completed: boolean;
}

const TodoItem: React.FC<TodoItemProps> = ({ text, completed }) => {
  return (
    <div style={{ textDecoration: completed ? 'line-through' : 'none' }}>
      <input type="checkbox" checked={completed} readOnly />
      <span>{text}</span>
    </div>
  );
};

export default TodoItem;
