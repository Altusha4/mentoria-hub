import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { showToast } from '../utils/toast';

export default function Login({ setStudentId }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      showToast.error('Email and password are required');
      return;
    }

    setLoading(true);
    const loadingToast = showToast.loading('Signing in...');

    try {
      const response = await api.login(email, password);

      sessionStorage.setItem('accessToken', response.access_token);
      sessionStorage.setItem('studentId', response.student_id);
      sessionStorage.setItem('studentName', response.name);

      setStudentId(response.student_id);

      showToast.dismiss(loadingToast);
      showToast.success(`Welcome back, ${response.name}! 👋`);

      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      showToast.dismiss(loadingToast);
      const errorMsg = err.message || 'Login failed. Please check your credentials.';
      showToast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 18px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const inputFocus = (e) => {
    e.target.style.borderColor = '#3cc5e0';
    e.target.style.boxShadow = '0 0 0 3px rgba(60,197,224,0.25)';
  };

  const inputBlur = (e) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.15)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
      background: 'linear-gradient(135deg, #060d18 0%, #0a1628 40%, #0f2a3d 70%, #0a1628 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{
        position: 'absolute', top: '-100px', right: '-60px',
        width: '350px', height: '350px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(60,197,224,0.12) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none',
      }} className="mentoria-orbFloat" />
      <div style={{
        position: 'absolute', bottom: '-80px', left: '-50px',
        width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(32,192,160,0.10) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none',
      }} className="mentoria-orbFloat" />

      <div style={{ maxWidth: '440px', width: '100%', position: 'relative', zIndex: 1 }}>
        {/* Glass Card */}
        <div className="mentoria-fadeInUp" style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px',
          padding: '44px 36px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <img src="/logo.png" alt="Mentoria Logo" style={{
              width: '52px', height: '52px', objectFit: 'contain', margin: '0 auto 20px',
              filter: 'drop-shadow(0 0 20px rgba(60,197,224,0.4))',
              display: 'block',
            }} />
            <h1 style={{
              fontSize: '28px', fontWeight: 800, margin: '0 0 8px',
              background: 'linear-gradient(135deg, #fff 0%, #3cc5e0 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Welcome Back
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px', margin: 0 }}>
              Sign in to your account
            </p>
          </div>

          {error && (
            <div style={{
              marginBottom: '20px', padding: '14px 18px',
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '12px',
            }}>
              <p style={{ color: '#f87171', fontWeight: 600, fontSize: '14px', margin: 0 }}>⚠️ {error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{
                display: 'block', fontSize: '13px', fontWeight: 600,
                color: 'rgba(255,255,255,0.7)', marginBottom: '8px', letterSpacing: '0.3px',
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
                onFocus={inputFocus}
                onBlur={inputBlur}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label style={{
                display: 'block', fontSize: '13px', fontWeight: 600,
                color: 'rgba(255,255,255,0.7)', marginBottom: '8px', letterSpacing: '0.3px',
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={inputStyle}
                onFocus={inputFocus}
                onBlur={inputBlur}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px 24px',
                fontWeight: 700, fontSize: '15px',
                borderRadius: '12px', border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                background: loading
                  ? 'rgba(60,197,224,0.3)'
                  : 'linear-gradient(135deg, #3cc5e0, #2195c4)',
                color: '#fff',
                transition: 'all 0.2s',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(60,197,224,0.3)',
                opacity: loading ? 0.6 : 1,
                marginTop: '4px',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            margin: '28px 0',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }} />

          <p style={{
            color: 'rgba(255,255,255,0.45)', textAlign: 'center', fontSize: '14px', margin: '0 0 16px',
          }}>
            Don't have an account?{' '}
            <Link to="/register" style={{
              color: '#3cc5e0', fontWeight: 700, textDecoration: 'none',
            }}>
              Create one here
            </Link>
          </p>

          <Link
            to="/register"
            style={{
              display: 'block', width: '100%', padding: '12px 24px',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'transparent',
              color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '15px',
              borderRadius: '12px', textAlign: 'center',
              textDecoration: 'none', transition: 'all 0.2s',
              boxSizing: 'border-box',
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#3cc5e0';
              e.target.style.color = '#3cc5e0';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.15)';
              e.target.style.color = 'rgba(255,255,255,0.7)';
            }}
          >
            New? Sign Up Instead
          </Link>
        </div>
      </div>
    </div>
  );
}
