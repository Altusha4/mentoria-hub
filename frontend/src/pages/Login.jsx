import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';

export default function Login({ setStudentId }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.login(email);

      // Save access token in memory (sessionStorage for security)
      sessionStorage.setItem('accessToken', response.access_token);

      // Save user info (tokens are in httpOnly cookies)
      sessionStorage.setItem('studentId', response.student_id);
      sessionStorage.setItem('studentName', response.name);

      // Set state
      setStudentId(response.student_id);

      // Redirect to home
      navigate('/');
    } catch (err) {
      setError('Login failed. Please check your email and try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center px-4 py-12">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-gray-600 text-center text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
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
