import { Link } from 'react-router-dom';

const getDifficultyColor = (level) => {
  const colors = {
    'beginner': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    'intermediate': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    'advanced': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  };
  return colors[level] || colors['beginner'];
};

const getDifficultyIcon = (level) => {
  const icons = {
    'beginner': '🌱',
    'intermediate': '🌳',
    'advanced': '🚀',
  };
  return icons[level] || '📚';
};

export default function CourseCard({ course, enrolled = false, progress = 0 }) {
  const lessonCount = course.lessons?.length || 0;
  const difficultyColor = getDifficultyColor(course.difficulty_level);
  const difficultyIcon = getDifficultyIcon(course.difficulty_level);

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-md dark:shadow-lg hover:shadow-2xl dark:hover:shadow-blue-900/30 transition-all duration-300 hover:-translate-y-2 overflow-hidden flex flex-col h-full">
      {/* Header with gradient background */}
      <div className="relative h-48 bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-600 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-300">
        {/* Decorative shapes */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-white rounded-full opacity-10"></div>
        <div className="absolute bottom-2 left-4 w-32 h-32 bg-white rounded-full opacity-5"></div>

        <div className="text-white text-center relative z-10">
          <div className="text-6xl mb-2 drop-shadow-lg">📚</div>
          <div className="text-5xl font-bold mb-2 drop-shadow-lg">{lessonCount}</div>
          <p className="text-teal-100 font-semibold">Lessons</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
          {course.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed flex-1">
          {course.description}
        </p>

        {/* Difficulty Level */}
        <div className="mb-6">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${difficultyColor.bg} ${difficultyColor.text} ${difficultyColor.border}`}>
            <span className="text-lg">{difficultyIcon}</span>
            <span className="font-semibold capitalize text-sm">{course.difficulty_level}</span>
          </div>
        </div>

        {/* Progress Bar (if enrolled) */}
        {enrolled && (
          <div className="mb-6 pb-6 border-t border-gray-100 pt-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-gray-700">Your Progress</span>
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-sm">
              <div
                className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Button */}
      <div className="px-6 pb-6">
        <Link
          to={`/courses/${course.id}`}
          className={`block w-full text-center font-bold py-3 rounded-lg transition-all transform hover:scale-105 shadow-md hover:shadow-lg ${
            enrolled
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
          }`}
        >
          {enrolled ? '▶️ Continue Learning' : '🎯 Enroll Now'}
        </Link>
      </div>
    </div>
  );
}
