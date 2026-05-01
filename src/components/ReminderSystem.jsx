import { useEffect, useState, useCallback } from 'react';
import api from '../utils/api';

export default function ReminderSystem() {
  const [notifs, setNotifs] = useState([]);

  const dismiss = (id) => setNotifs(prev => prev.filter(n => n.id !== id));

  const checkReminders = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: todos } = await api.get(`/todos?date=${today}`);
      const now = new Date();
      const upcoming = todos.filter(t => {
        if (t.isCompleted || !t.timeSlot) return false;
        const [start] = t.timeSlot.split(' - ');
        const [h, m] = start.split(':').map(Number);
        const taskTime = new Date();
        taskTime.setHours(h, m, 0, 0);
        const diff = (taskTime - now) / 60000;
        return diff > 0 && diff <= 15;
      });
      upcoming.forEach(t => {
        setNotifs(prev => {
          if (prev.find(n => n.taskId === t._id)) return prev;
          const id = Date.now() + Math.random();
          setTimeout(() => dismiss(id), 8000);
          return [...prev, { id, taskId: t._id, title: t.title, timeSlot: t.timeSlot }];
        });
      });
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    checkReminders();
    const iv = setInterval(checkReminders, 60000);
    return () => clearInterval(iv);
  }, [checkReminders]);

  if (!notifs.length) return null;

  return (
    <div className="notif-container">
      {notifs.map(n => (
        <div key={n.id} className="notif warning">
          <span style={{ fontSize: '1.2rem' }}>🔔</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Upcoming task in ~15 min</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {n.title} — {n.timeSlot}
            </div>
          </div>
          <button
            onClick={() => dismiss(n.id)}
            style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1, cursor: 'pointer', border: 'none', background: 'none' }}
          >✕</button>
        </div>
      ))}
    </div>
  );
}
