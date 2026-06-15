import { Link } from 'react-router-dom';

export default function CourseCard({ course, enrolled = false, progress = 0 }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="h-40 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-4xl font-bold mb-2">{course.lessons?.length || 0}</div>
          <p className="text-blue-100">Lessons</p>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Level</span>
            <span className="font-medium text-gray-900">{course.difficulty_level}</span>
          </div>
        </div>

        {enrolled && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-gray-900">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <Link
          to={`/courses/${course.id}`}
          className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
        >
          {enrolled ? 'Continue' : 'Enroll Now'}
        </Link>
      </div>
    </div>
  );
}
