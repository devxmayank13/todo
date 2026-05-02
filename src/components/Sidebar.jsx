import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/dashboard', icon: '⚡', label: 'Dashboard' },
  { to: '/planner',   icon: '🤖', label: 'Goal Planner' },
  { to: '/tasks',     icon: '✅', label: 'Tasks' },
  { to: '/calendar',  icon: '📅', label: 'Calendar' },
  { to: '/focus',     icon: '🍅', label: 'Focus Mode' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };


  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, bottom: 0,
      width: 'var(--sidebar-w)',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      padding: '24px 16px',
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '0 8px', marginBottom: '32px' }}>
        <div style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          <span style={{ color: 'var(--accent-light)' }}>GoalCraft</span> AI
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Powered by Gemini</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {NAV.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '10px 12px', borderRadius: 'var(--radius-md)',
            fontWeight: 600, fontSize: '0.875rem',
            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
            background: isActive ? 'var(--bg-card)' : 'transparent',
            borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
            transition: 'all var(--transition)',
          })}>
            <span style={{ fontSize: '1.1rem' }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 4px' }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.9rem', color: '#fff', flexShrink: 0,
          }}>
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.username}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 12px', borderRadius: 'var(--radius-sm)',
            background: 'transparent', color: 'var(--text-muted)',
            border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
}
