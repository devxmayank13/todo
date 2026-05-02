import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import confetti from 'canvas-confetti';

export default function FocusMode() {
  const [todos, setTodos] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  const fetchPending = useCallback(async () => {
    try {
      const { data } = await api.get(`/todos?date=${today}`);
      setTodos(data.filter(t => !t.isCompleted));
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [today]);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (isActive && timeLeft === 0) {
      clearInterval(interval);
      handleComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleComplete = async () => {
    setIsActive(false);
    confetti({ particleCount: 200, spread: 90, origin: { y: 0.5 } });
    try {
      await api.put(`/todos/${selectedTask._id}`, { isCompleted: true });
      setSelectedTask(null);
      setTimeLeft(25 * 60);
      fetchPending();
    } catch (err) {
      console.error('Failed to complete task', err);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => { setIsActive(false); setTimeLeft(25 * 60); };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <div className="page-header">
        <h1>🍅 Focus Mode</h1>
        <p>Eliminate distractions. Pick a task and focus for 25 minutes.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '32px' }}>
        {/* Task Selection Sidebar */}
        <div className="card" style={{ alignSelf: 'start' }}>
          <h3 style={{ marginBottom: 16, fontSize: '1.1rem', fontWeight: 800 }}>Pending Tasks</h3>
          {loading ? <div className="loader-wrap"><div className="spinner" /></div>
            : todos.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 10px' }}>
                <div className="empty-icon">🎉</div>
                <p>All caught up for today!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {todos.map(t => (
                  <div 
                    key={t._id} 
                    onClick={() => { if (!isActive) { setSelectedTask(t); setTimeLeft(25 * 60); } }}
                    style={{ 
                      padding: 16, 
                      borderRadius: 12, 
                      background: selectedTask?._id === t._id ? 'rgba(147, 51, 234, 0.2)' : 'rgba(0,0,0,0.2)',
                      border: `1px solid ${selectedTask?._id === t._id ? 'var(--accent)' : 'rgba(255,255,255,0.05)'}`,
                      cursor: isActive ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: isActive && selectedTask?._id !== t._id ? 0.4 : 1
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t.title}</div>
                    {t.timeSlot && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>{t.timeSlot}</div>}
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* Timer Main Area */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', minHeight: '400px' }}>
          {!selectedTask ? (
            <div className="empty-state">
              <div className="empty-icon">👈</div>
              <p>Select a task from the left to start focusing.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', animation: 'scaleIn 0.3s ease' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-light)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Currently Focusing On
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 40, maxWidth: '80%' }}>{selectedTask.title}</h2>
              
              <div style={{ 
                fontSize: '6rem', 
                fontWeight: 800, 
                lineHeight: 1, 
                fontVariantNumeric: 'tabular-nums',
                background: isActive ? 'linear-gradient(135deg, var(--accent-light), #fff)' : 'linear-gradient(135deg, var(--text-secondary), #fff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: 40,
                textShadow: isActive ? '0 0 40px rgba(147, 51, 234, 0.4)' : 'none',
                transition: 'all 0.3s'
              }}>
                {formatTime(timeLeft)}
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <button 
                  className="btn btn-primary" 
                  onClick={toggleTimer}
                  style={{ fontSize: '1.1rem', padding: '14px 32px' }}
                >
                  {isActive ? '⏸ Pause' : '▶️ Start Focus'}
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={resetTimer}
                  style={{ fontSize: '1.1rem', padding: '14px 24px' }}
                >
                  🔄 Reset
                </button>
              </div>

              {isActive && (
                <div style={{ marginTop: 32, fontSize: '0.9rem', color: 'var(--text-secondary)', animation: 'fadeIn 1s infinite alternate' }}>
                  Stay focused! You can do this.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
