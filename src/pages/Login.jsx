import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);

    // ── ADMIN BYPASS (purely client-side, no backend needed) ──
    if (
      (form.email === 'admin' || form.email === 'admin@test.com') &&
      form.password === 'mayank123'
    ) {
      const fakeToken = 'admin-bypass-token-for-testing';
      const fakeUser  = { id: 'admin-dummy-id', username: 'admin', email: 'admin@test.com' };
      login(fakeToken, fakeUser);
      navigate('/dashboard');
      setLoading(false);
      return;
    }
    // ─────────────────────────────────────────────────────────

    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };


  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">✦ <span>GoalCraft</span> AI</div>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Email or Username</label>
            <input id="login-email" className="form-input" type="text" placeholder="you@example.com or admin"
              value={form.email} onChange={set('email')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="login-password" className="form-input" type="password" placeholder="••••••••"
              value={form.password} onChange={set('password')} required />
          </div>
          <button id="login-submit" type="submit" className="btn btn-primary" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
            {loading ? 'Signing in…' : '→ Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
