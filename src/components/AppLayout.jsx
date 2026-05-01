import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ReminderSystem from './ReminderSystem';

export default function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
      <ReminderSystem />
    </div>
  );
}
