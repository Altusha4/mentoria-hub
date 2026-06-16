import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Welcome from './pages/Welcome';
import Home from './pages/Home';
import Opportunities from './pages/Opportunities';
import Courses from './pages/Courses';
import Course from './pages/Course';
import Lesson from './pages/Lesson';
import ProfileNew from './pages/ProfileNew';
import Login from './pages/Login';
import Register from './pages/Register';
import Search from './pages/Search';
import Updates from './pages/Updates';
import OpportunityDetail from './pages/OpportunityDetail';
import Guardian from './pages/Guardian';
import './index.css';

function AppContent({ studentId, setStudentId, handleLogout }) {
  const location = useLocation();
  const showFooter = studentId && location.pathname !== '/profile';

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      {studentId && <Header studentId={studentId} setStudentId={() => handleLogout()} />}

      <main className="flex-1">
        <Routes>
          {/* Welcome page - shown to everyone */}
          <Route path="/welcome" element={<Welcome />} />

          {/* Public routes - Auth */}
          <Route path="/login" element={<Login setStudentId={setStudentId} />} />
          <Route path="/register" element={<Register setStudentId={setStudentId} />} />

          {/* Protected routes - redirect to login if not logged in */}
          <Route
            path="/"
            element={studentId ? <Home studentId={studentId} /> : <Navigate to="/welcome" />}
          />
          <Route
            path="/opportunities"
            element={studentId ? <Opportunities studentId={studentId} /> : <Navigate to="/login" />}
          />
          <Route
            path="/opportunities/:id"
            element={studentId ? <OpportunityDetail studentId={studentId} /> : <Navigate to="/login" />}
          />
          <Route
            path="/courses"
            element={studentId ? <Courses studentId={studentId} /> : <Navigate to="/login" />}
          />
          <Route
            path="/courses/:id"
            element={studentId ? <Course studentId={studentId} /> : <Navigate to="/login" />}
          />
          <Route
            path="/courses/:courseId/lesson/:lessonId"
            element={studentId ? <Lesson studentId={studentId} /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={studentId ? <ProfileNew studentId={studentId} /> : <Navigate to="/login" />}
          />
          <Route
            path="/search"
            element={studentId ? <Search studentId={studentId} /> : <Navigate to="/login" />}
          />
          <Route
            path="/updates"
            element={studentId ? <Updates /> : <Navigate to="/login" />}
          />
          <Route
            path="/guardian"
            element={studentId ? <Guardian studentId={studentId} /> : <Navigate to="/login" />}
          />

          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to={studentId ? "/" : "/login"} />} />
        </Routes>
      </main>

      {showFooter && <Footer />}
    </div>
  );
}

export default function App() {
  const [studentId, setStudentId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load student from sessionStorage on app start (JWT tokens in httpOnly cookies)
    const savedStudentId = sessionStorage.getItem('studentId');
    const accessToken = sessionStorage.getItem('accessToken');

    if (savedStudentId && accessToken) {
      setStudentId(parseInt(savedStudentId));
    }

    // Clear old localStorage theme key
    localStorage.removeItem('theme');

    setLoading(false);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('studentId');
    sessionStorage.removeItem('studentName');
    sessionStorage.removeItem('accessToken');
    setStudentId(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <AppContent studentId={studentId} setStudentId={setStudentId} handleLogout={handleLogout} />
    </BrowserRouter>
  );
}
