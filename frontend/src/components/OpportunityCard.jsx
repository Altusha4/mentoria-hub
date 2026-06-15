import { Link } from 'react-router-dom';

const getCategoryIcon = (category) => {
  const icons = {
    'олимпиада': '🏆',
    'стажировка': '💼',
    'хакатон': '💻',
    'конкурс': '🎖️',
    'стипендия': '💰',
    'программа': '📚',
    'конференция': '🎤',
  };
  return icons[category] || '⭐';
};

export default function OpportunityCard({ opportunity, onSave, saved = false }) {
  const deadline = new Date(opportunity.deadline);
  const daysLeft = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysLeft <= 7;
  const categoryIcon = getCategoryIcon(opportunity.category);

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-md dark:shadow-lg hover:shadow-2xl dark:hover:shadow-blue-900/30 transition-all duration-300 hover:-translate-y-2 overflow-hidden flex flex-col h-full">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{categoryIcon}</span>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                {opportunity.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onSave}
            className={`flex-shrink-0 text-2xl transition-all transform ${
              saved
                ? 'text-red-500 scale-125'
                : 'text-gray-300 hover:text-red-500 hover:scale-110'
            }`}
            title={saved ? 'Remove from saved' : 'Save opportunity'}
          >
            ♥
          </button>
        </div>

        {/* Category and Direction Tags */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full hover:bg-blue-200 transition-colors">
            🏷️ {opportunity.category}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full hover:bg-purple-200 transition-colors">
            🎯 {opportunity.direction}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col">
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed">{opportunity.description}</p>

        {/* Details Grid */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2">
              📍 Format
            </span>
            <span className="font-semibold text-gray-900 dark:text-white text-sm bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-full">
              {opportunity.format}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2">
              👥 Grade
            </span>
            <span className="font-semibold text-gray-900 dark:text-white text-sm bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-full">
              {opportunity.grade_level}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2">
              ⏰ Deadline
            </span>
            <span className={`font-bold text-sm px-3 py-1 rounded-full ${
              isUrgent
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {daysLeft > 0 ? `${daysLeft} days` : 'Expired'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Button */}
      <div className="px-6 pb-6">
        <Link
          to={`/opportunities/${opportunity.id}`}
          className="block w-full text-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
        >
          Learn More →
        </Link>
      </div>
    </div>
  );
}
