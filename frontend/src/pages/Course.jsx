import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useTheme } from '../context/ThemeContext';

/* ── Difficulty config ───────────────────── */
const DIFF = {
  beginner:     { label: 'Beginner',     color: '#20c0a0', bg: 'rgba(32,192,160,0.1)'  },
  intermediate: { label: 'Intermediate', color: '#3cc5e0', bg: 'rgba(60,197,224,0.1)'  },
  advanced:     { label: 'Advanced',     color: '#a855f7', bg: 'rgba(168,85,247,0.1)'  },
};
function getDiff(level) {
  if (!level) return DIFF.beginner;
  const k = Object.keys(DIFF).find(k => level.toLowerCase().includes(k));
  return k ? DIFF[k] : DIFF.beginner;
}

export default function Course({ studentId }) {
  const { id } = useParams();
  const { theme } = useTheme();
  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [progressData, setProgressData] = useState({ progress: 0, completed_lessons: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    if (studentId) {
      fetchCourseData(); 
    }
  }, [id, studentId]);

  const fetchCourseData = async () => {
    setLoading(true);
    try {
      const [courseData, progressInfo] = await Promise.all([
        api.getCourse(id),
        api.getCourseProgress(id, studentId)
      ]);
      setCourse(courseData);
      
      if (progressInfo.enrolled) {
        setEnrolled(true);
        setProgressData(progressInfo);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!studentId || enrolling) return;
    setEnrolling(true);
    try {
      await api.enrollCourse(id, studentId);
      setEnrolled(true);
    } catch (e) {
      console.error(e);
    } finally {
      setEnrolling(false);
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#060d18]' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(60,197,224,0.08)' }}>
            <div className="w-7 h-7 border-2 border-[#3cc5e0] border-t-transparent rounded-full animate-spin" />
          </div>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Loading course…</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#060d18]' : 'bg-gray-50'}`}>
        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Course not found.</p>
      </div>
    );
  }

  const diff = getDiff(course.difficulty_level);
  const lessonCount = course.lessons?.length || 0;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-[#060d18]' : 'bg-gray-50'}`}>

      {/* ═════ HERO ═════════════════════════════ */}
      <div className="relative overflow-hidden" style={{
        background: theme === 'dark'
          ? 'linear-gradient(135deg, #0a1628 0%, #001a35 40%, #0f1f2e 100%)'
          : 'linear-gradient(135deg, #0c1e3a 0%, #0d2847 50%, #0f1f2e 100%)'
      }}>
        {/* Glow */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${diff.color}, transparent 70%)` }} />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
          {/* Back */}
          <Link to="/courses" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mb-8">
            ← Courses
          </Link>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="flex-1 min-w-0">
              {/* Difficulty */}
              <span className="inline-block px-3 py-1 rounded-lg text-xs font-bold mb-4"
                style={{ color: diff.color, background: diff.bg }}>
                {diff.label}
              </span>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
                {course.title}
              </h1>

              {course.description && (
                <p className="text-slate-400 text-base leading-relaxed max-w-xl">
                  {course.description}
                </p>
              )}

              {/* Stats pills */}
              <div className="flex flex-wrap gap-2 mt-5">
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full
                  ${theme === 'dark' ? 'bg-white/[0.06] text-gray-300' : 'bg-white/20 text-white'}`}>
                  {lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'}
                </span>
                {course.difficulty_level && (
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize
                    ${theme === 'dark' ? 'bg-white/[0.06] text-gray-300' : 'bg-white/20 text-white'}`}>
                    {course.difficulty_level}
                  </span>
                )}
              </div>
            </div>

            {/* Enroll button */}
            {!enrolled ? (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="flex-shrink-0 px-7 py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.02] disabled:opacity-60"
                style={{ background: `linear-gradient(135deg, ${diff.color}, #2195c4)` }}
              >
                {enrolling ? 'Enrolling…' : 'Enroll Now'}
              </button>
            ) : (
              <div className="flex-shrink-0 flex items-center gap-3">
                <div className="flex items-center gap-2 px-5 py-3 rounded-xl"
                  style={{ background: 'rgba(32,192,160,0.12)', border: '1px solid rgba(32,192,160,0.3)' }}>
                  <span className="text-[#20c0a0] text-base">✓</span>
                  <span className="text-sm font-bold text-[#20c0a0]">Enrolled</span>
                </div>
                {progressData.progress >= 100 && (
                  <a
                    href={api.getCertificateUrl(id, studentId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      if (window.confetti) {
                        window.confetti({
                          particleCount: 150,
                          spread: 70,
                          origin: { y: 0.6 }
                        });
                      }
                    }}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download Certificate
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
          style={{ background: theme === 'dark' ? 'linear-gradient(to bottom, transparent, #060d18)' : 'linear-gradient(to bottom, transparent, #f9fafb)' }} />
      </div>

      {/* ═════ CONTENT ══════════════════════════ */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Lesson list */}
        <div className={`rounded-2xl overflow-hidden border ${theme === 'dark' ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-gray-100 shadow-sm'}`}>

          {/* Header */}
          <div className={`flex items-center justify-between px-7 py-5 border-b
            ${theme === 'dark' ? 'border-white/[0.06]' : 'border-gray-100'}`}>
            <div>
              <h2 className={`font-bold text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Course Content
              </h2>
              <p className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                {lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'}
              </p>
            </div>
            <div className="w-1 h-5 rounded-full" style={{ background: diff.color }} />
          </div>

          {/* Lessons */}
          {lessonCount > 0 ? (
            <div className="divide-y" style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.04)' : '#f3f4f6' }}>
              {course.lessons.map((lesson, index) => (
                <Link
                  key={lesson.id}
                  to={`/courses/${course.id}/lesson/${lesson.id}`}
                  className={`group flex items-center gap-5 px-7 py-5 transition-all duration-200
                    ${theme === 'dark'
                      ? 'hover:bg-white/[0.04]'
                      : 'hover:bg-gray-50'
                    }`}
                >
                  {/* Number bubble or Checkmark */}
                  {progressData.completed_lessons?.includes(lesson.id) ? (
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-105"
                      style={{ background: 'rgba(32,192,160,0.15)' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#20c0a0" strokeWidth="3" className="w-5 h-5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  ) : (
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-all duration-200 group-hover:scale-105"
                      style={{ background: diff.bg, color: diff.color }}
                    >
                      {index + 1}
                    </div>
                  )}

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-sm leading-snug transition-colors duration-200
                      ${theme === 'dark'
                        ? 'text-gray-200 group-hover:text-white'
                        : 'text-gray-800 group-hover:text-gray-900'
                      }`}>
                      {lesson.title}
                    </h3>
                    {lesson.content && (
                      <p className={`text-xs mt-1 line-clamp-1 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
                        {lesson.content}
                      </p>
                    )}
                  </div>

                  {/* Duration if exists */}
                  {lesson.duration && (
                    <span className={`text-xs font-medium flex-shrink-0 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
                      {lesson.duration} min
                    </span>
                  )}

                  {/* Arrow */}
                  <svg
                    viewBox="0 0 20 20" fill="currentColor"
                    className={`w-4 h-4 flex-shrink-0 transition-all duration-200 group-hover:translate-x-0.5
                      ${theme === 'dark' ? 'text-gray-700 group-hover:text-[#3cc5e0]' : 'text-gray-300 group-hover:text-[#2195c4]'}`}
                  >
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Link>
              ))}
            </div>
          ) : (
            <div className={`px-8 py-16 text-center`}>
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{ background: diff.bg }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7" style={{ color: diff.color }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                No lessons available yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
