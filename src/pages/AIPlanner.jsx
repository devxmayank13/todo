import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const TEMPLATES = [
  {
    id: 'dsa',
    emoji: '🧠',
    title: '30 Days DSA Preparation',
    desc: 'Arrays, Linked Lists, Trees, Graphs, DP & more. Interview-ready.',
    defaultDays: 30,
    defaultHours: 3,
    goal: '30 days DSA preparation covering Arrays, Linked Lists, Stacks, Queues, Trees, Graphs, and Dynamic Programming for coding interviews',
    category: 'Study',
  },
  {
    id: 'fitness',
    emoji: '💪',
    title: 'Beginner Fitness Plan',
    desc: 'Cardio, strength training, and recovery. No gym required.',
    defaultDays: 21,
    defaultHours: 1,
    goal: 'Beginner fitness plan with cardio, bodyweight strength training, flexibility, and rest days for a healthy lifestyle',
    category: 'Health',
  },
  {
    id: 'webdev',
    emoji: '🌐',
    title: 'Web Development Roadmap',
    desc: 'HTML → CSS → JS → React → Node.js. Project-based learning.',
    defaultDays: 60,
    defaultHours: 4,
    goal: 'Complete web development roadmap from HTML/CSS basics through JavaScript, React frontend, and Node.js backend with projects',
    category: 'Study',
  },
  {
    id: 'python',
    emoji: '🐍',
    title: 'Python Mastery',
    desc: 'Fundamentals to OOP, file handling, APIs, and automation.',
    defaultDays: 30,
    defaultHours: 2,
    goal: 'Python programming from fundamentals through OOP, file handling, APIs, and automation scripts',
    category: 'Study',
  },
  {
    id: 'reading',
    emoji: '📚',
    title: '21-Day Reading Habit',
    desc: 'Build a consistent daily reading habit with structured sessions.',
    defaultDays: 21,
    defaultHours: 1,
    goal: 'Build a daily reading habit with structured sessions covering non-fiction books, summaries, and reflection',
    category: 'Personal',
  },
  {
    id: 'startup',
    emoji: '🚀',
    title: 'Launch Your Side Project',
    desc: 'Idea → MVP → Launch. Weekly milestones and daily tasks.',
    defaultDays: 30,
    defaultHours: 2,
    goal: 'Build and launch a side project from idea validation to MVP and public launch with marketing and user feedback',
    category: 'Work',
  },
];

export default function AIPlanner() {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [form, setForm] = useState({ goal: '', durationDays: 7, dailyHours: 2, startDate: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const selectTemplate = (tpl) => {
    setSelectedTemplate(tpl.id);
    setForm(f => ({ ...f, goal: tpl.goal, durationDays: tpl.defaultDays, dailyHours: tpl.defaultHours }));
  };

  const generate = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true); setResult(null);
    try {
      const { data } = await api.post('/ai-planner/generate', {
        goal: form.goal,
        durationDays: Number(form.durationDays),
        dailyHours: Number(form.dailyHours),
        startDate: form.startDate,
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate plan. Check your Gemini API key.');
    } finally { setLoading(false); }
  };

  const priorityClass = { High: 'high', Medium: 'medium', Low: 'low' };

  return (
    <div>
      <div className="page-header">
        <h1>🤖 AI Planner</h1>
        <p>Generate a structured day-by-day plan for any goal using Gemini AI</p>
      </div>

      {/* Template Gallery */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>⚡ Quick Start Templates</h2>
        <div className="templates-grid">
          {TEMPLATES.map(tpl => (
            <div key={tpl.id}
              className={`template-card ${selectedTemplate === tpl.id ? 'selected' : ''}`}
              onClick={() => selectTemplate(tpl)}
              id={`template-${tpl.id}`}
            >
              <div className="template-emoji">{tpl.emoji}</div>
              <div className="template-title">{tpl.title}</div>
              <div className="template-desc">{tpl.desc}</div>
              <div className="template-meta">
                <span className="badge badge-study">{tpl.defaultDays}d</span>
                <span className="badge badge-medium">{tpl.defaultHours}h/day</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Form */}
      <div className="card">
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>✍️ Customize Your Plan</h2>
        {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}
        <form onSubmit={generate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Goal</label>
            <textarea id="planner-goal" className="form-input" rows={3}
              value={form.goal} onChange={set('goal')}
              placeholder="e.g. Prepare for coding interviews in 30 days with 3 hours daily"
              required style={{ resize: 'vertical' }} />
          </div>
          <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="form-group">
              <label className="form-label">Duration (days)</label>
              <input id="planner-days" className="form-input" type="number" min={1} max={90}
                value={form.durationDays} onChange={set('durationDays')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Hours per Day</label>
              <input id="planner-hours" className="form-input" type="number" min={0.5} max={12} step={0.5}
                value={form.dailyHours} onChange={set('dailyHours')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input id="planner-start" className="form-input" type="date"
                value={form.startDate} onChange={set('startDate')} required />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button id="generate-plan-btn" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Generating…</>
              ) : '✨ Generate AI Plan'}
            </button>
            {result && (
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/tasks')}>
                View Tasks →
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="card" style={{ marginTop: 24, textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🤖</div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Gemini is crafting your plan…</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Breaking down your goal into daily time slots
          </div>
          <div className="loader-wrap" style={{ paddingTop: 20 }}><div className="spinner" /></div>
        </div>
      )}

      {/* Plan Output */}
      {result && !loading && (
        <div className="plan-output">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
              ✅ Plan Generated — {result.todos?.length} tasks saved
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Saved to your calendar automatically
            </span>
          </div>

          {result.plan?.map((day) => (
            <div key={day.day} className="day-block">
              <div className="day-label">Day {day.day}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {day.tasks.map((task, i) => (
                  <div key={i} className="card card-sm" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 36, height: 36, flexShrink: 0,
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--accent-glow)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1rem',
                    }}>
                      {task.category === 'Study' ? '📖' : task.category === 'Health' ? '💪' : task.category === 'Work' ? '💼' : '✅'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{task.title}</div>
                      {task.description && <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>{task.description}</div>}
                      <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        {task.startTime && <span className="task-time">🕐 {task.startTime} – {task.endTime}</span>}
                        <span className={`badge badge-${priorityClass[task.priority] || 'medium'}`}>{task.priority}</span>
                        <span className={`badge badge-${task.category?.toLowerCase() || 'other'}`}>{task.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
