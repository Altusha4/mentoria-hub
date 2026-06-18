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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{
      background: 'linear-gradient(to bottom right, #2195c4, #20c0a0)'
    }}>
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Mentoria Logo" className="w-12 h-12 mx-auto mb-4 object-contain" />
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent"
              style={{ focus: 'none' }}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px #3cc5e0'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent"
              style={{ focus: 'none' }}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px #3cc5e0'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ backgroundColor: '#2195c4' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-gray-600 text-center text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold hover:opacity-80" style={{ color: '#2195c4' }}>
              Create one here
            </Link>
          </p>
        </div>

        <div className="mt-6">
          <Link
            to="/register"
            className="block w-full px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 text-center transition-colors"
          >
            New? Sign Up Instead
          </Link>
        </div>
      </div>
    </div>
  );
}
