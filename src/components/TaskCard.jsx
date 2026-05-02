import { useState } from 'react';
import api from '../utils/api';

export default function TaskCard({ task, onUpdate, onDelete, onEdit, refreshData }) {
  const [loading, setLoading] = useState(false);
  const [breakingDown, setBreakingDown] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      const updated = await api.put(`/todos/${task._id}`, { isCompleted: !task.isCompleted });
      onUpdate(updated.data);
    } finally { setLoading(false); }
  };

  const handleBreakdown = async () => {
    setBreakingDown(true);
    try {
      await api.post(`/todos/${task._id}/breakdown`);
      if (refreshData) refreshData();
    } catch (err) {
      console.error(err);
      alert('Failed to break down task');
    } finally { setBreakingDown(false); }
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
          {task.tags && task.tags.map(tag => (
            <span key={tag} className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="task-actions">
        {!task.isCompleted && refreshData && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleBreakdown}
            disabled={breakingDown}
            title="Use AI to break this task down"
            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
          >
            {breakingDown ? '✨...' : '✨ Break down'}
          </button>
        )}
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
