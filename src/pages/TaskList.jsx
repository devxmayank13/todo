import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import TaskCard from '../components/TaskCard';

const PRIORITIES = ['All', 'High', 'Medium', 'Low'];
const CATEGORIES = ['All', 'Study', 'Work', 'Personal', 'Health', 'Other'];
const STATUS     = ['All', 'Pending', 'Completed'];

const BLANK = { title: '', description: '', date: new Date().toISOString().split('T')[0], timeSlot: '', priority: 'Medium', category: 'Personal' };

export default function TaskList() {
  const [todos, setTodos]       = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [priority, setPriority] = useState('All');
  const [category, setCategory] = useState('All');
  const [status, setStatus]     = useState('All');
  const [search, setSearch]     = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState(BLANK);
  const [saving, setSaving]     = useState(false);

  const openAddModal = () => { setForm(BLANK); setShowModal(true); };
  const handleEdit = (task) => { 
    setForm({ 
      ...task, 
      date: new Date(task.date).toISOString().split('T')[0],
      tags: task.tags ? task.tags.join(', ') : ''
    }); 
    setShowModal(true); 
  };

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (priority !== 'All') params.set('priority', priority);
      if (category !== 'All') params.set('category', category);
      const { data } = await api.get(`/todos?${params}`);
      setTodos(data);
    } finally { setLoading(false); }
  }, [priority, category]);

  useEffect(() => { fetchTodos(); }, [fetchTodos]);

  useEffect(() => {
    let out = todos;
    if (status === 'Pending')   out = out.filter(t => !t.isCompleted);
    if (status === 'Completed') out = out.filter(t =>  t.isCompleted);
    if (search.trim()) out = out.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
    setFiltered(out);
  }, [todos, status, search]);

  const handleUpdate = (updated) => setTodos(t => t.map(x => x._id === updated._id ? updated : x));
  const handleDelete = async (id) => { await api.delete(`/todos/${id}`); setTodos(t => t.filter(x => x._id !== id)); };

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
      fetchTodos();
      setShowModal(false); setForm(BLANK);
    } finally { setSaving(false); }
  };

  const completed = todos.filter(t => t.isCompleted).length;

  return (
    <div>
      <div className="page-header">
        <h1>✅ Task List</h1>
        <p>{todos.length} total tasks · {completed} completed · {todos.length - completed} pending</p>
      </div>

      {/* Search + Add */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <input
          id="task-search"
          className="form-input"
          style={{ flex: 1, minWidth: 180 }}
          placeholder="🔍 Search tasks…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button id="add-task-list-btn" className="btn btn-primary" onClick={openAddModal}>+ Add Task</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        <div className="filters-bar">
          {PRIORITIES.map(p => (
            <button key={p} className={`filter-btn ${priority === p ? 'active' : ''}`} onClick={() => setPriority(p)} id={`filter-priority-${p}`}>{p}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div className="filters-bar" style={{ margin: 0 }}>
            {CATEGORIES.map(c => (
              <button key={c} className={`filter-btn ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)} id={`filter-cat-${c}`}>{c}</button>
            ))}
          </div>
          <div className="filters-bar" style={{ margin: 0 }}>
            {STATUS.map(s => (
              <button key={s} className={`filter-btn ${status === s ? 'active' : ''}`} onClick={() => setStatus(s)} id={`filter-status-${s}`}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="loader-wrap"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>No tasks match your filters</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(t => (
            <TaskCard key={t._id} task={t} onUpdate={handleUpdate} onDelete={handleDelete} onEdit={handleEdit} refreshData={fetchTodos} />
          ))}
        </div>
      )}

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
                <input id="tl-task-title" className="form-input" value={form.title} onChange={set('title')} placeholder="Task title" required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input id="tl-task-desc" className="form-input" value={form.description} onChange={set('description')} placeholder="Optional description" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input id="tl-task-date" className="form-input" type="date" value={form.date} onChange={set('date')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Time Slot</label>
                  <input id="tl-task-time" className="form-input" value={form.timeSlot} onChange={set('timeSlot')} placeholder="e.g. 10:00 - 11:00" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select id="tl-task-priority" className="form-input" value={form.priority} onChange={set('priority')}>
                    <option>High</option><option>Medium</option><option>Low</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select id="tl-task-category" className="form-input" value={form.category} onChange={set('category')}>
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
                <button id="tl-save-task-btn" type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
