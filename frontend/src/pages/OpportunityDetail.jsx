import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

export default function OpportunityDetail({ studentId }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [successChance, setSuccessChance] = useState(null);
  const [showChanceModal, setShowChanceModal] = useState(false);
  const [chanceLoading, setChanceLoading] = useState(false);

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

  const handleCheckChance = async () => {
    if (!studentId) {
      alert('Please login first');
      return;
    }

    setChanceLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/opportunities/${opportunity.id}/success-chance/${studentId}`);
      if (!response.ok) throw new Error('Failed to fetch success chance');
      const data = await response.json();
      setSuccessChance(data);
      setShowChanceModal(true);
    } catch (error) {
      console.error('Error checking success chance:', error);
      alert('Failed to check success chance. Please try again.');
    } finally {
      setChanceLoading(false);
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

            {/* CTA Buttons */}
            <div className="space-y-3">
              {(() => {
                const effectiveUrl = opportunity.apply_url || opportunity.source_url;
                const label = opportunity.apply_url ? 'Apply Now →' : opportunity.source_url ? 'Open Source →' : null;
                return effectiveUrl ? (
                  <a
                    href={effectiveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-lg transition-all transform hover:scale-105 shadow-lg"
                  >
                    {label}
                  </a>
                ) : (
                  <div className="block w-full text-center bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 font-bold py-4 rounded-lg cursor-default select-none">
                    Application link not available yet
                  </div>
                );
              })()}

              <button
                onClick={handleCheckChance}
                disabled={chanceLoading}
                className="block w-full text-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {chanceLoading ? '🔄 Analyzing...' : '✨ Check My Success Chance'}
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
              AI will analyze your profile to estimate your chances
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

      {/* Success Chance Modal */}
      {showChanceModal && successChance && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 z-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Success Chance Analysis</h2>
              <button
                onClick={() => setShowChanceModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Main Score */}
              <div className="text-center">
                <div className="text-6xl font-bold mb-2">
                  {successChance.percentage >= 70 ? '🎉' : successChance.percentage >= 50 ? '🚀' : '💪'}
                </div>
                <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {successChance.percentage.toFixed(0)}%
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {successChance.percentage >= 70
                    ? 'Strong chances! Your profile matches well'
                    : successChance.percentage >= 50
                    ? 'Moderate chances. You could improve your profile'
                    : 'Low chances. Follow recommendations to improve'}
                </p>
              </div>

              {/* Score Breakdown */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">📊 Score Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Skill Match', value: successChance.score_breakdown.skill_match, color: 'blue' },
                    { label: 'Semantic Match', value: successChance.score_breakdown.semantic_match, color: 'purple' },
                    { label: 'Academic Score', value: successChance.score_breakdown.academic_score, color: 'green' },
                    { label: 'Interest Match', value: successChance.score_breakdown.interest_match, color: 'orange' },
                    { label: 'Profile Completeness', value: successChance.score_breakdown.profile_completeness, color: 'pink' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-32">{item.label}</span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r from-${item.color}-400 to-${item.color}-600 transition-all`}
                          style={{ width: `${Math.round(item.value * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white w-12 text-right">
                        {Math.round(item.value * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Matching Skills */}
              {successChance.matching_skills.length > 0 && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                  <h3 className="font-bold text-green-900 dark:text-green-300 mb-3">✅ Matching Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {successChance.matching_skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-200 text-sm font-semibold rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Skills */}
              {successChance.missing_skills.length > 0 && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6">
                  <h3 className="font-bold text-orange-900 dark:text-orange-300 mb-3">⚠️ Missing Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {successChance.missing_skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-orange-200 dark:bg-orange-800 text-orange-900 dark:text-orange-200 text-sm font-semibold rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {successChance.recommendations.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                  <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-3">💡 Recommendations to Improve</h3>
                  <ul className="space-y-2">
                    {successChance.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-blue-900 dark:text-blue-200 text-sm">
                        <span className="text-lg">→</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setShowChanceModal(false)}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
