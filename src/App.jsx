import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Dashboard from './pages/Dashboard';
import AIPlanner from './pages/AIPlanner';
import CalendarView from './pages/CalendarView';
import TaskList from './pages/TaskList';
import FocusMode from './pages/FocusMode';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="planner" element={<AIPlanner />} />
        <Route path="calendar" element={<CalendarView />} />
        <Route path="tasks" element={<TaskList />} />
        <Route path="focus" element={<FocusMode />} />
      </Route>
    </Routes>
  );
}
