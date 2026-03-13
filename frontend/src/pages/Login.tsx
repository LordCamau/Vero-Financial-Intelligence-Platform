import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/authContext';
import api from '../services/api';

const LoginPage: React.FC = () => {
  const { login, accessToken } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ email: '', password: '', full_name: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (accessToken) {
      navigate('/overview');
    }
  }, [accessToken, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'register') {
        await api.post('/auth/register', {
          email: form.email,
          password: form.password,
          full_name: form.full_name
        });
      }
      await login(form.email, form.password);
      navigate('/overview');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Unable to authenticate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <h1>Welcome to Vero</h1>
        <p>Connect your financial world and unlock intelligence.</p>
        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-grid">
              <input
                placeholder="Full name"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>
          )}
          <div className="form-grid">
            <input
              type="email"
              placeholder="Email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
          <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
            <button className="primary" type="submit" disabled={loading}>
              {loading ? 'Working...' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            >
              {mode === 'login' ? 'Create account' : 'Back to login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
