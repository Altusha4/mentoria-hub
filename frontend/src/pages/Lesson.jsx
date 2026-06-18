import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import QuizComponent from '../components/QuizComponent';
import { showToast } from '../utils/toast';

/* ── Feedback options ────────────────────── */
const FEEDBACK_OPTIONS = ['Very helpful', 'Helpful', 'Somewhat helpful', 'Not helpful'];

export default function Lesson({ studentId }) {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  /* ── Next/Prev lesson (computed early) ── */
  const lessons = course?.lessons || [];
  const currentIdx = lessons.findIndex(l => l.id === parseInt(lessonId));
  const prevLesson = currentIdx > 0 ? lessons[currentIdx - 1] : null;
  const nextLesson = currentIdx >= 0 && currentIdx < lessons.length - 1 ? lessons[currentIdx + 1] : null;

  useEffect(() => { fetchData(); }, [lessonId, courseId, studentId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lessonData, courseData] = await Promise.all([
        api.getLesson(lessonId),
        api.getCourse(courseId),
      ]);
      setLesson(lessonData);
      setCourse(courseData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!studentId || completing) return;

    // Show quiz first if exists and not submitted
    if (lesson?.quiz && !quizSubmitted) {
      setShowQuiz(true);
      return;
    }

    setCompleting(true);
    try {
      await api.completeLesson(lessonId, studentId);
      setCompleted(true);
      showToast.success('Lesson completed! 🎉');

      // Navigate to next lesson
      setTimeout(() => handleNextNavigation(), 1500);
    } catch (e) {
      console.error(e);
      showToast.error('Failed to complete lesson');
    } finally {
      setCompleting(false);
    }
  };

  const handleQuizComplete = async () => {
    setQuizSubmitted(true);
    if (!studentId || completing) return;

    setCompleting(true);
    try {
      await api.completeLesson(lessonId, studentId);
      setCompleted(true);
      showToast.success('Lesson completed! 🎉');

      // Navigate to next lesson
      setTimeout(() => handleNextNavigation(), 1500);
    } catch (e) {
      console.error(e);
      showToast.error('Failed to complete lesson');
    } finally {
      setCompleting(false);
    }
  };

  const handleSubmitQuiz = () => {
    if (!feedback) return;
    setQuizSubmitted(true);
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
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Loading lesson…</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#060d18]' : 'bg-gray-50'}`}>
        <div className="text-center">
          <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Lesson not found.</p>
          <Link to={`/courses/${courseId}`} className="text-[#3cc5e0] font-semibold text-sm hover:underline">
            Back to course →
          </Link>
        </div>
      </div>
    );
  }

  const lessonNum = currentIdx >= 0 ? currentIdx + 1 : null; const handleNextNavigation = () => {
    if (nextLesson) {
      navigate(`/course/${courseId}/lesson/${nextLesson.id}`);
    } else {
      navigate(`/course/${courseId}`);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-[#060d18]' : 'bg-gray-50'}`}>

      {/* ═════ TOP NAV BAR ══════════════════════ */}
      <div className={`sticky top-0 z-40 border-b backdrop-blur-md
        ${theme === 'dark'
          ? 'bg-[#060d18]/90 border-white/[0.06]'
          : 'bg-white/90 border-gray-200'
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <Link
            to={`/courses/${courseId}`}
            className={`flex items-center gap-2 text-sm font-medium transition-colors flex-shrink-0
              ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {course?.title || 'Course'}
          </Link>

          {/* Progress dots */}
          {lessons.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 overflow-hidden max-w-xs">
              {lessons.slice(0, 12).map((l, i) => (
                <div
                  key={l.id}
                  className="flex-shrink-0 transition-all duration-300"
                  style={{
                    width: i === currentIdx ? 20 : 6,
                    height: 6,
                    borderRadius: 9999,
                    background: i === currentIdx
                      ? '#3cc5e0'
                      : i < currentIdx
                        ? 'rgba(60,197,224,0.4)'
                        : theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e5e7eb'
                  }}
                />
              ))}
              {lessons.length > 12 && (
                <span className={`text-xs ml-1 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
                  +{lessons.length - 12}
                </span>
              )}
            </div>
          )}

          {lessonNum && (
            <span className={`text-xs font-semibold flex-shrink-0 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              {lessonNum} / {lessons.length}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ═════ LESSON TITLE ══════════════════════ */}
        <div>
          {lessonNum && (
            <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
              Lesson {lessonNum}
            </p>
          )}
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {lesson.title}
          </h1>
        </div>

        {/* ═════ VIDEO ════════════════════════════ */}
        <div className={`rounded-2xl overflow-hidden border aspect-video flex items-center justify-center
          ${theme === 'dark' ? 'bg-black/60 border-white/[0.06]' : 'bg-gray-900 border-gray-200'}`}>
          {lesson.video_url ? (
            <iframe
              width="100%"
              height="100%"
              src={lesson.video_url.replace('watch?v=', 'embed/')}
              frameBorder="0"
              allowFullScreen
              title={lesson.title}
              className="w-full h-full"
            />
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-white/[0.06]">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-gray-500">
                  <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">No video available for this lesson</p>
            </div>
          )}
        </div>

        {/* ═════ CONTENT ══════════════════════════ */}
        {lesson.content && (
          <div className={`rounded-2xl p-7 border ${theme === 'dark' ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-white border-gray-100 shadow-sm'}`}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-5 rounded-full bg-[#3cc5e0]" />
              <h2 className={`font-bold text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Lesson Content
              </h2>
            </div>
            <p className={`text-sm leading-relaxed whitespace-pre-wrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {lesson.content}
            </p>
          </div>
        )}

        {/* ═════ FEEDBACK QUIZ ════════════════════ */}
        <div className={`rounded-2xl border overflow-hidden ${theme === 'dark' ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-white border-gray-100 shadow-sm'}`}>
          {/* Header */}
          <div className={`px-7 py-5 border-b ${theme === 'dark' ? 'border-white/[0.06]' : 'border-gray-100'}`}>
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 rounded-full bg-[#a855f7]" />
              <h2 className={`font-bold text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Quick Feedback
              </h2>
            </div>
          </div>

          <div className="px-7 py-6">
            {!quizSubmitted ? (
              <>
                <p className={`text-sm font-semibold mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  How did you find this lesson?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
                  {FEEDBACK_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setFeedback(opt)}
                      className={`py-3 px-4 rounded-xl text-sm font-semibold border transition-all duration-200 text-left
                        ${feedback === opt
                          ? 'border-[#3cc5e0]/50 text-[#3cc5e0]'
                          : theme === 'dark'
                            ? 'border-white/[0.08] text-gray-400 hover:border-white/[0.15] hover:text-gray-200'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        }`}
                      style={feedback === opt ? { background: 'rgba(60,197,224,0.08)' } : {}}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleSubmitQuiz}
                  disabled={!feedback}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}
                >
                  Submit Feedback
                </button>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(32,192,160,0.12)' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#20c0a0" strokeWidth="2.5" className="w-6 h-6">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Thanks for your feedback!
                </p>
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  You rated this lesson: <span className="text-[#3cc5e0] font-semibold">{feedback}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ═════ QUIZ ═════════════════════════════ */}
        {showQuiz && lesson?.quiz && (
          <div className="mb-8">
            <QuizComponent
              quiz={lesson.quiz}
              lesson={lesson}
              onComplete={handleQuizComplete}
            />
          </div>
        )}

        {/* ═════ COMPLETE BUTTON ══════════════════ */}
        {!completed && !showQuiz ? (
          <button
            onClick={handleComplete}
            disabled={completing}
            className="w-full py-4 rounded-2xl text-sm font-black text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.01] disabled:opacity-60 flex items-center justify-center gap-3 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #20c0a0, #1db896)' }}
          >
            {completing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Marking complete…
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Mark as Complete & Continue
              </>
            )}
          </button>
        ) : (
          <div className="w-full py-4 rounded-2xl flex items-center justify-center gap-3"
            style={{ background: 'rgba(32,192,160,0.1)', border: '1px solid rgba(32,192,160,0.3)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#20c0a0" strokeWidth="2.5" className="w-5 h-5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-sm font-black text-[#20c0a0]">Lesson Completed!</span>
          </div>
        )}

        {/* ═════ PREV / NEXT NAVIGATION ═══════════ */}
        <div className={`grid gap-3 ${prevLesson && nextLesson ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
          {prevLesson && (
            <Link
              to={`/courses/${courseId}/lesson/${prevLesson.id}`}
              className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 group
                ${theme === 'dark'
                  ? 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1]'
                  : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
                }`}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:-translate-x-0.5
                ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <div className="min-w-0">
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
                  Previous
                </p>
                <p className={`text-sm font-semibold truncate ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {prevLesson.title}
                </p>
              </div>
            </Link>
          )}

          {nextLesson && (
            <Link
              to={`/courses/${courseId}/lesson/${nextLesson.id}`}
              className={`flex items-center justify-end gap-3 p-4 rounded-2xl border transition-all duration-200 group
                ${theme === 'dark'
                  ? 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-[#3cc5e0]/20'
                  : 'bg-white border-gray-100 hover:border-[#3cc5e0]/30 hover:shadow-sm'
                } ${!prevLesson ? 'col-span-1' : ''}`}
            >
              <div className="min-w-0 text-right">
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
                  Next
                </p>
                <p className="text-sm font-semibold truncate text-[#3cc5e0]">
                  {nextLesson.title}
                </p>
              </div>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0 text-[#3cc5e0] transition-transform group-hover:translate-x-0.5">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}
