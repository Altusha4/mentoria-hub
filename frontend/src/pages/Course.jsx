import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../utils/api';

export default function Course({ studentId }) {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const data = await api.getCourse(id);
      setCourse(data);
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!studentId) {
      alert('Please login first');
      return;
    }

    try {
      await api.enrollCourse(id, studentId);
      setEnrolled(true);
      alert('Successfully enrolled in course!');
    } catch (error) {
      console.error('Error enrolling:', error);
      alert('Failed to enroll');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading course...</div>;
  }

  if (!course) {
    return <div className="text-center py-12">Course not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Course Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-8 rounded-lg mb-8">
        <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
        <p className="text-lg text-blue-100 mb-6">{course.description}</p>
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <p className="text-blue-100">Difficulty Level</p>
            <p className="font-semibold text-lg">{course.difficulty_level}</p>
          </div>
          {!enrolled && (
            <button
              onClick={handleEnroll}
              className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              Enroll Now
            </button>
          )}
        </div>
      </div>

      {/* Lessons */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Course Content</h2>
          <p className="text-gray-600">({course.lessons?.length || 0} lessons)</p>
        </div>

        {course.lessons && course.lessons.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {course.lessons.map((lesson, index) => (
              <Link
                key={lesson.id}
                to={`/courses/${course.id}/lesson/${lesson.id}`}
                className="block px-8 py-6 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="font-semibold text-blue-600">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{lesson.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-1">{lesson.content}</p>
                  </div>
                  <div className="ml-4">
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-8 py-12 text-center">
            <p className="text-gray-500">No lessons available yet</p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <Link
          to="/courses"
          className="inline-block px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Courses
        </Link>
      </div>
    </div>
  );
}
