import { Link } from 'react-router-dom';

export default function Header({ studentId, setStudentId }) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="Mentoria Logo" className="w-10 h-10 object-contain" />
            <span className="text-xl font-bold text-gray-900">Mentoria Hub</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/opportunities" className="text-gray-700 hover:text-blue-600 font-medium">
              Opportunities
            </Link>
            <Link to="/courses" className="text-gray-700 hover:text-blue-600 font-medium">
              Courses
            </Link>
            <Link to="/profile" className="text-gray-700 hover:text-blue-600 font-medium">
              Profile
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {studentId ? (
              <button
                onClick={() => setStudentId(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => setStudentId(1)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Login
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
