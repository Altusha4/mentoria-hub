import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../utils/api';

export default function Lesson({ studentId }) {
  const { courseId, lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    fetchData();
  }, [lessonId, courseId, studentId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const lessonData = await api.getLesson(lessonId);
      const courseData = await api.getCourse(courseId);
      setLesson(lessonData);
      setCourse(courseData);

      // Check if lesson is already completed
      if (studentId && lessonData) {
        // Get enrolled courses to check progress
        try {
          const enrolledCourses = await api.getEnrolledCourses(studentId);
          const courseEnrollment = enrolledCourses.find(e => e.course_id === parseInt(courseId));
          if (courseEnrollment) {
            // Fetch lesson progress from backend
            // For now, we check if progress exists in the progress relationship
            setCompleted(false); // Will be updated on next backend call
          }
        } catch (err) {
          console.error('Error checking completion:', err);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteLesson = async () => {
    if (!studentId) {
      alert('Please login first');
      return;
    }

    try {
      await api.completeLesson(lessonId, studentId);
      setCompleted(true);
      alert('Lesson completed! Great job!');
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
    // Simple quiz validation - in real app, would send to backend
    alert('Quiz submitted! Check your answers below.');
  };

  if (loading) {
    return <div className="text-center py-12">Loading lesson...</div>;
  }

  if (!lesson) {
    return <div className="text-center py-12">Lesson not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link to={`/courses/${courseId}`} className="text-blue-600 hover:text-blue-700">
          ← Back to {course?.title}
        </Link>
      </div>

      {/* Lesson Header */}
      <h1 className="text-4xl font-bold text-gray-900 mb-8">{lesson.title}</h1>

      {/* Video Section */}
      <div className="bg-black rounded-lg overflow-hidden mb-8 aspect-video flex items-center justify-center">
        {lesson.video_url ? (
          <iframe
            width="100%"
            height="100%"
            src={lesson.video_url.replace('watch?v=', 'embed/')}
            frameBorder="0"
            allowFullScreen
            title={lesson.title}
          />
        ) : (
          <div className="text-white text-center">
            <div className="text-6xl mb-4">▶️</div>
            <p>Video placeholder</p>
          </div>
        )}
      </div>

      {/* Lesson Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Lesson Content</h2>
        <p className="text-gray-700 whitespace-pre-wrap">{lesson.content}</p>
      </div>

      {/* Mini Quiz */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Quiz</h2>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="font-semibold text-gray-900 mb-3">Q: How did you find this lesson?</p>
            <div className="space-y-2">
              {['Very helpful', 'Helpful', 'Somewhat helpful', 'Not helpful'].map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name="feedback"
                    value={option}
                    onChange={(e) => setQuizAnswers({ ...quizAnswers, feedback: e.target.value })}
                    className="mr-3"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={handleSubmitQuiz}
          className="mt-6 w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          Submit Quiz
        </button>
        {quizSubmitted && (
          <p className="mt-4 text-green-600 font-medium">✓ Quiz submitted!</p>
        )}
      </div>

      {/* Complete Lesson Button */}
      {!completed ? (
        <button
          onClick={handleCompleteLesson}
          className="w-full px-6 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold text-lg rounded-lg transition-colors"
        >
          Mark as Complete & Continue
        </button>
      ) : (
        <div className="w-full px-6 py-4 bg-green-100 text-green-700 font-semibold text-lg rounded-lg text-center">
          ✓ Lesson Completed!
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <Link
          to={`/courses/${courseId}`}
          className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
        >
          ← Back to Course
        </Link>
        {course?.lessons && (
          <Link
            to={`/courses/${courseId}`}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
          >
            See All Lessons →
          </Link>
        )}
      </div>
    </div>
  );
}
