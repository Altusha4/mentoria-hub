import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Opportunities from './pages/Opportunities';
import Courses from './pages/Courses';
import Course from './pages/Course';
import Lesson from './pages/Lesson';
import Profile from './pages/Profile';
import './index.css';

export default function App() {
  const [studentId, setStudentId] = useState(1); // Default: student 1 logged in

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header studentId={studentId} setStudentId={setStudentId} />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/opportunities" element={<Opportunities studentId={studentId} />} />
            <Route path="/courses" element={<Courses studentId={studentId} />} />
            <Route path="/courses/:id" element={<Course studentId={studentId} />} />
            <Route path="/courses/:courseId/lesson/:lessonId" element={<Lesson studentId={studentId} />} />
            <Route path="/profile" element={<Profile studentId={studentId} />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}
