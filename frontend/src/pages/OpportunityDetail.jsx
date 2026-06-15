import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

export default function OpportunityDetail({ studentId }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchOpportunity();
  }, [id]);

  const fetchOpportunity = async () => {
    setLoading(true);
    try {
      // Get all opportunities and find the one with matching ID
      const data = await api.getOpportunities({});
      const opp = data.find(o => o.id === parseInt(id));

      if (opp) {
        setOpportunity(opp);
        // Check if saved
        if (studentId) {
          const savedData = await api.getSavedOpportunities(studentId);
          const isSaved = savedData.some(item => item.opportunity.id === opp.id);
          setSaved(isSaved);
        }
      } else {
        navigate('/opportunities');
      }
    } catch (error) {
      console.error('Error fetching opportunity:', error);
      navigate('/opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!studentId) {
      alert('Please login first');
      return;
    }

    try {
      if (saved) {
        await api.unsaveOpportunity(opportunity.id, studentId);
        setSaved(false);
      } else {
        await api.saveOpportunity(opportunity.id, studentId);
        setSaved(true);
      }
    } catch (error) {
      console.error('Error saving opportunity:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">⏳</div>
          <p className="text-gray-600 dark:text-gray-400">Loading opportunity...</p>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Opportunity not found</p>
          <Link to="/opportunities" className="text-blue-600 hover:text-blue-700 font-semibold">
            Back to opportunities →
          </Link>
        </div>
      </div>
    );
  }

  const deadline = new Date(opportunity.deadline);
  const daysLeft = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysLeft <= 7;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Link */}
        <Link to="/opportunities" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold mb-8">
          ← Back to Opportunities
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                {opportunity.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {opportunity.description}
              </p>
            </div>
            <button
              onClick={handleSave}
              className={`flex-shrink-0 text-4xl transition-all transform ${
                saved
                  ? 'text-red-500 scale-125'
                  : 'text-gray-300 hover:text-red-500 hover:scale-110'
              }`}
              title={saved ? 'Remove from saved' : 'Save opportunity'}
            >
              ♥
            </button>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-semibold rounded-full">
              🏷️ {opportunity.category}
            </span>
            <span className="inline-flex items-center gap-1 px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-sm font-semibold rounded-full">
              🎯 {opportunity.direction}
            </span>
            <span className="inline-flex items-center gap-1 px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm font-semibold rounded-full">
              📍 {opportunity.format}
            </span>
            <span className="inline-flex items-center gap-1 px-4 py-2 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 text-sm font-semibold rounded-full">
              👥 Grade {opportunity.grade_level}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Left: Details */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Details</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Format
                </h3>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {opportunity.format}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Grade Level
                </h3>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {opportunity.grade_level}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Deadline
                </h3>
                <div className="flex items-center gap-3">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {deadline.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    isUrgent
                      ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  }`}>
                    {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Category
                </h3>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {opportunity.category}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Direction
                </h3>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {opportunity.direction}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Requirements & CTA */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Requirements</h2>

            <div className="mb-8">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {opportunity.requirements}
              </p>
            </div>

            {/* CTA Button */}
            <a
              href={opportunity.apply_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Apply Now →
            </a>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
              You will be redirected to the official application page
            </p>
          </div>
        </div>

        {/* Full Description */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Full Description</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {opportunity.description}
          </p>
        </div>

        {/* Footer CTA */}
        <div className="text-center">
          <Link
            to="/opportunities"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
          >
            ← Back to Opportunities
          </Link>
        </div>
      </div>
    </div>
  );
}
