import { useState } from 'react';
import api from '../utils/api';

export default function TaskCard({ task, onUpdate, onDelete, onEdit }) {
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      const updated = await api.put(`/todos/${task._id}`, { isCompleted: !task.isCompleted });
      onUpdate(updated.data);
    } finally { setLoading(false); }
  };

  const priorityClass = { High: 'high', Medium: 'medium', Low: 'low' }[task.priority] || 'medium';
  const categoryClass  = task.category?.toLowerCase() || 'other';

  return (
    <div className={`task-card ${task.isCompleted ? 'completed' : ''}`}>
      <button
        className={`task-check ${task.isCompleted ? 'checked' : ''}`}
        onClick={toggle}
        disabled={loading}
        aria-label="Toggle complete"
        title="Toggle complete"
      >
        {task.isCompleted && <span style={{ color: '#fff', fontSize: '0.75rem' }}>✓</span>}
      </button>

      <div className="task-body">
        <div className={`task-title ${task.isCompleted ? 'done' : ''}`}>{task.title}</div>
        {task.description && <div className="task-desc">{task.description}</div>}
        <div className="task-meta">
          {task.timeSlot && (
            <span className="task-time">🕐 {task.timeSlot}</span>
          )}
          <span className={`badge badge-${priorityClass}`}>{task.priority}</span>
          <span className={`badge badge-${categoryClass}`}>{task.category}</span>
        </div>
      </div>

      <div className="task-actions">
        {onEdit && (
          <button
            className="btn btn-secondary btn-icon btn-sm"
            onClick={() => onEdit(task)}
            title="Edit task"
          >✏️</button>
        )}
        <button
          className="btn btn-danger btn-icon btn-sm"
          onClick={() => onDelete(task._id)}
          title="Delete task"
        >🗑</button>
      </div>
    </div>
  );
}
