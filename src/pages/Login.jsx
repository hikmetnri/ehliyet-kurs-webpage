import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import api from '../api';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', { email, password });
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Navigate to dashboard
      navigate('/dashboard');
      window.location.reload(); // Quick way to update navbar state
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Giriş başarısız oldu. Bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <h2 className="auth-title">Hoş Geldiniz</h2>
          <p className="auth-subtitle">Sınav portalına devam etmek için giriş yapın.</p>
        </div>

        {error && (
          <div style={{ color: '#ef4444', marginBottom: 20, padding: 12, background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label className="input-label" htmlFor="email">E-posta Adresi</label>
            <input 
              className="input-field" 
              type="email" 
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mail@ornek.com"
              required 
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">Şifre</label>
            <input 
              className="input-field" 
              type="password" 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required 
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: 12 }}
            disabled={loading}
          >
            {loading ? 'Giriş yapılıyor...' : <>Giriş Yap <LogIn size={18} /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
