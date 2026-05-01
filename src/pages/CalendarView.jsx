import { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';
import api from '../utils/api';
import TaskCard from '../components/TaskCard';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [todos, setTodos] = useState([]);
  const [dayTodos, setDayTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  // map of date strings to task count
  const [taskMap, setTaskMap] = useState({});

  // Fetch all tasks for the current month
  const fetchMonthTasks = useCallback(async () => {
    try {
      const { data } = await api.get('/todos');
      const map = {};
      data.forEach(t => {
        const key = format(new Date(t.date), 'yyyy-MM-dd');
        map[key] = (map[key] || 0) + 1;
      });
      setTaskMap(map);
      setTodos(data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchMonthTasks(); }, [fetchMonthTasks]);

  const fetchDayTasks = useCallback(async (date) => {
    setLoading(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const { data } = await api.get(`/todos?date=${dateStr}`);
      setDayTodos(data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDayTasks(selectedDate); }, [selectedDate, fetchDayTasks]);

  const handleUpdate = (updated) => {
    setDayTodos(d => d.map(x => x._id === updated._id ? updated : x));
    fetchMonthTasks();
  };
  const handleDelete = async (id) => {
    await api.delete(`/todos/${id}`);
    setDayTodos(d => d.filter(x => x._id !== id));
    fetchMonthTasks();
  };

  // Build calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd   = endOfMonth(currentMonth);
  const gridStart  = startOfWeek(monthStart);
  const gridEnd    = endOfWeek(monthEnd);
  const cells = [];
  let day = gridStart;
  while (day <= gridEnd) { cells.push(day); day = addDays(day, 1); }

  const today = new Date();

  return (
    <div>
      <div className="page-header">
        <h1>📅 Calendar</h1>
        <p>Browse your tasks by date</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Calendar */}
        <div className="card">
          {/* Month Nav */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>← Prev</button>
            <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{format(currentMonth, 'MMMM yyyy')}</span>
            <button className="btn btn-secondary btn-sm" onClick={() => setCurrentMonth(m => addMonths(m, 1))}>Next →</button>
          </div>

          {/* Day labels */}
          <div className="calendar-grid">
            {DAY_NAMES.map(d => <div key={d} className="cal-day-name">{d}</div>)}
            {cells.map((cell, i) => {
              const key = format(cell, 'yyyy-MM-dd');
              const isToday    = isSameDay(cell, today);
              const isSelected = isSameDay(cell, selectedDate);
              const isOther    = !isSameMonth(cell, currentMonth);
              const count      = taskMap[key] || 0;

              return (
                <div key={i}
                  className={`cal-cell ${isToday ? 'today' : ''} ${isSelected && !isToday ? 'selected' : ''} ${isOther ? 'other-month' : ''}`}
                  onClick={() => setSelectedDate(cell)}
                  id={`cal-${key}`}
                >
                  {format(cell, 'd')}
                  {count > 0 && (
                    <div className="cal-dots">
                      {Array.from({ length: Math.min(count, 3) }).map((_, di) => (
                        <div key={di} className="cal-dot" />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Day Tasks Panel */}
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 14, color: 'var(--accent-light)' }}>
            {format(selectedDate, 'EEEE, MMM d')}
          </div>
          {loading ? (
            <div className="loader-wrap"><div className="spinner" /></div>
          ) : dayTodos.length === 0 ? (
            <div className="empty-state" style={{ paddingTop: 40 }}>
              <div className="empty-icon">🗓️</div>
              <p>No tasks on this day</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {dayTodos.map(t => (
                <TaskCard key={t._id} task={t} onUpdate={handleUpdate} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
