import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import confetti from 'canvas-confetti';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';

const BLANK_FORM = { title: '', description: '', date: new Date().toISOString().split('T')[0], timeSlot: '', priority: 'Medium', category: 'Personal', tags: '' };

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats]   = useState(null);
  const [todos, setTodos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]     = useState(BLANK_FORM);
  const [saving, setSaving] = useState(false);
  
  const prevProgressRef = useRef(0);

  const openAddModal = () => { setForm(BLANK_FORM); setShowModal(true); };
  const handleEdit = (task) => { 
    setForm({ 
      ...task, 
      date: new Date(task.date).toISOString().split('T')[0],
      tags: task.tags ? task.tags.join(', ') : ''
    }); 
    setShowModal(true); 
  };

  const today = new Date().toISOString().split('T')[0];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, tRes] = await Promise.all([
        api.get('/todos/stats'),
        api.get(`/todos?date=${today}`),
      ]);
      setStats(sRes.data);
      setTodos(tRes.data.sort((a,b) => (a.order || 0) - (b.order || 0)));
      
      // Confetti Logic
      if (sRes.data.todayProgress === 100 && prevProgressRef.current < 100) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      }
      prevProgressRef.current = sRes.data.todayProgress;

    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [today]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdate = (updated) => setTodos(t => t.map(x => x._id === updated._id ? updated : x));
  const handleDelete = async (id) => {
    await api.delete(`/todos/${id}`);
    setTodos(t => t.filter(x => x._id !== id));
    fetchData();
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, tags: form.tags.split(',').map(tag => tag.trim()).filter(Boolean) };
      if (payload._id) {
        await api.put(`/todos/${payload._id}`, payload);
      } else {
        await api.post('/todos', payload);
      }
      fetchData();
      setShowModal(false); setForm(BLANK_FORM);
    } finally { setSaving(false); }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const items = Array.from(todos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Optimistic update
    const updatedItems = items.map((item, index) => ({ ...item, order: index }));
    setTodos(updatedItems);

    try {
      await api.put('/todos/reorder', { 
        items: updatedItems.map(item => ({ id: item._id, order: item.order })) 
      });
    } catch (err) {
      console.error('Failed to reorder', err);
      fetchData(); // revert on failure
    }
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1>{greeting}, {user?.username} 👋</h1>
        <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Stat Cards */}
      {loading && !stats ? (
        <div className="loader-wrap"><div className="spinner" /></div>
      ) : stats && (
        <div className="stats-grid">
          <div className="stat-card purple">
            <div className="stat-icon" style={{ background: 'rgba(147, 51, 234, 0.15)' }}>📋</div>
            <div className="stat-value">{stats.todayTotal}</div>
            <div className="stat-label">Today's Tasks</div>
          </div>
          <div className="stat-card green">
            <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>✅</div>
            <div className="stat-value">{stats.todayCompleted}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card amber">
            <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>⏳</div>
            <div className="stat-value">{stats.todayPending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card cyan">
            <div className="stat-icon" style={{ background: 'rgba(6,182,212,0.15)' }}>📊</div>
            <div className="stat-value">{stats.overallProgress}%</div>
            <div className="stat-label">Overall Progress</div>
          </div>
        </div>
      )}

      {/* Today's Progress */}
      {stats && (
        <div className="card" style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: '1rem' }}>Today's Progress</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--accent-light)', fontWeight: 800 }}>{stats.todayProgress}%</span>
          </div>
          <div className="progress-bar-wrap">
            <div className="progress-bar-fill" style={{ width: `${stats.todayProgress}%` }} />
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 10, fontWeight: 500 }}>
            {stats.todayCompleted} of {stats.todayTotal} tasks completed
          </div>
        </div>
      )}

      {/* Today's Tasks */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Today's Tasks</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <button id="add-task-btn" className="btn btn-primary btn-sm" onClick={openAddModal}>+ Add Task</button>
          <Link to="/planner" className="btn btn-secondary btn-sm">🤖 AI Plan</Link>
        </div>
      </div>

      {loading && !todos.length ? <div className="loader-wrap"><div className="spinner" /></div>
        : todos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>No tasks for today. Add one or generate an AI plan!</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="todos">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {todos.map((t, index) => (
                    <Draggable key={t._id} draggableId={t._id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            opacity: snapshot.isDragging ? 0.8 : 1,
                            transform: snapshot.isDragging ? provided.draggableProps.style.transform : 'none'
                          }}
                        >
                          <TaskCard 
                            task={t} 
                            onUpdate={updated => { handleUpdate(updated); fetchData(); }} 
                            onDelete={handleDelete} 
                            onEdit={handleEdit} 
                            refreshData={fetchData}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )
      }

      {/* Add/Edit Task Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>{form._id ? 'Edit Task' : 'Add New Task'}</h2>
              <button onClick={() => setShowModal(false)} className="btn btn-secondary btn-icon">✕</button>
            </div>
            <form className="modal-form" onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input id="task-title" className="form-input" value={form.title} onChange={set('title')} placeholder="Task title" required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input id="task-desc" className="form-input" value={form.description} onChange={set('description')} placeholder="Optional description" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input id="task-date" className="form-input" type="date" value={form.date} onChange={set('date')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Time Slot</label>
                  <input id="task-time" className="form-input" value={form.timeSlot} onChange={set('timeSlot')} placeholder="e.g. 10:00 - 11:00" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select id="task-priority" className="form-input" value={form.priority} onChange={set('priority')}>
                    <option>High</option><option>Medium</option><option>Low</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select id="task-category" className="form-input" value={form.category} onChange={set('category')}>
                    <option>Study</option><option>Work</option><option>Personal</option><option>Health</option><option>Other</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Tags (comma separated)</label>
                <input className="form-input" value={form.tags} onChange={set('tags')} placeholder="e.g. urgent, frontend, review" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button id="save-task-btn" type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
