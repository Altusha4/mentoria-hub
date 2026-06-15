import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Opportunities from './pages/Opportunities';
import Courses from './pages/Courses';
import Course from './pages/Course';
import Lesson from './pages/Lesson';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import './index.css';

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
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('studentId');
    localStorage.removeItem('studentName');
    localStorage.removeItem('studentInterests');
    setStudentId(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-gray-50">
        {studentId && <Header studentId={studentId} setStudentId={() => handleLogout()} />}

        <main className="flex-1">
          <Routes>
            {/* Public routes - Auth */}
            <Route path="/login" element={<Login setStudentId={setStudentId} />} />
            <Route path="/register" element={<Register setStudentId={setStudentId} />} />

            {/* Protected routes - redirect to login if not logged in */}
            <Route
              path="/"
              element={studentId ? <Home studentId={studentId} /> : <Navigate to="/login" />}
            />
            <Route
              path="/opportunities"
              element={studentId ? <Opportunities studentId={studentId} /> : <Navigate to="/login" />}
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
              element={studentId ? <Profile studentId={studentId} /> : <Navigate to="/login" />}
            />

            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to={studentId ? "/" : "/login"} />} />
          </Routes>
        </main>

        {studentId && <Footer />}
      </div>
    </BrowserRouter>
  );
}
