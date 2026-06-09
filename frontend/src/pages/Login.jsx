import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-wrap">
      <section className="auth-card">
        <h1 className="page-title">VulnTrack Pro</h1>
        <p className="page-subtitle">Sign in to manage vulnerability reports.</p>
        <form onSubmit={handleSubmit} style={{ marginTop: '22px' }}>
          <label htmlFor="email">
            Email
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label htmlFor="password">
            Password
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="muted" style={{ marginTop: '16px' }}>
          Need an account? <Link to="/register">Register</Link>
        </p>
      </section>
    </main>
  );
};

export default Login;
