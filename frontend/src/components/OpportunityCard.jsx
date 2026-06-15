import { Link } from 'react-router-dom';

export default function OpportunityCard({ opportunity, onSave, saved = false }) {
  const deadline = new Date(opportunity.deadline);
  const daysLeft = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{opportunity.title}</h3>
          <div className="flex gap-2 mt-2">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
              {opportunity.category}
            </span>
            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
              {opportunity.direction}
            </span>
          </div>
        </div>
        <button
          onClick={onSave}
          className={`text-2xl transition-colors ${saved ? 'text-red-500' : 'text-gray-300 hover:text-red-500'}`}
        >
          ♥
        </button>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{opportunity.description}</p>

      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Format:</span>
          <span className="font-medium text-gray-900">{opportunity.format}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Grade Level:</span>
          <span className="font-medium text-gray-900">{opportunity.grade_level}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Deadline:</span>
          <span className={`font-medium ${daysLeft <= 7 ? 'text-red-600' : 'text-gray-900'}`}>
            {daysLeft} days left
          </span>
        </div>
      </div>

      <Link
        to={`/opportunities/${opportunity.id}`}
        className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
      >
        View Details
      </Link>
    </div>
  );
}
