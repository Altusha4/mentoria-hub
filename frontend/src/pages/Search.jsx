import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import OpportunityCard from '../components/OpportunityCard';
import CourseCard from '../components/CourseCard';

export default function Search({ studentId }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [opportunities, setOpportunities] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(new Set());
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (query.trim()) {
      performSearch();
    }
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const [oppResults, courseResults, savedOpp] = await Promise.all([
        api.getOpportunities({ category: query }),
        api.searchCourses(query),
        api.getSavedOpportunities(studentId),
      ]);

      setOpportunities(oppResults);
      setCourses(courseResults);

      const savedIds = new Set(savedOpp.map(item => item.opportunity.id));
      setSaved(savedIds);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (opportunityId) => {
    try {
      if (saved.has(opportunityId)) {
        await api.unsaveOpportunity(opportunityId, studentId);
        setSaved(prev => {
          const newSet = new Set(prev);
          newSet.delete(opportunityId);
          return newSet;
        });
      } else {
        await api.saveOpportunity(opportunityId, studentId);
        setSaved(prev => new Set([...prev, opportunityId]));
      }
    } catch (error) {
      console.error('Error saving opportunity:', error);
    }
  };

  const totalResults = opportunities.length + courses.length;
  const oppCount = opportunities.length;
  const courseCount = courses.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            🔍 Search Results
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
            Results for: <span className="font-bold text-blue-600 dark:text-blue-400">"{query}"</span>
          </p>

          {!loading && totalResults > 0 && (
            <div className="bg-gradient-to-r from-blue-50 dark:from-blue-900/30 to-indigo-50 dark:to-indigo-900/30 rounded-xl p-6 border border-blue-200 dark:border-blue-800 transition-colors">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{totalResults}</div>
                  <p className="text-gray-700 dark:text-gray-300 font-semibold">Total Results</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400">{oppCount}</div>
                  <p className="text-gray-700 dark:text-gray-300 font-semibold">Opportunities</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">{courseCount}</div>
                  <p className="text-gray-700 dark:text-gray-300 font-semibold">Courses</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700 transition-colors">
          {[
            { id: 'all', label: `All (${totalResults})`, icon: '📋' },
            { id: 'opportunities', label: `Opportunities (${oppCount})`, icon: '🎯' },
            { id: 'courses', label: `Courses (${courseCount})`, icon: '📚' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-semibold transition-all border-b-4 ${
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              <span className="text-lg mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 animate-bounce">⏳</div>
            <p className="text-gray-600 text-lg">Searching...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && totalResults === 0 && (
          <div className="text-center py-16">
            <div className="text-8xl mb-4">🔍</div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">No results found</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Try adjusting your search terms or explore opportunities and courses from the main pages.
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && totalResults > 0 && (
          <>
            {/* Opportunities */}
            {(activeTab === 'all' || activeTab === 'opportunities') && oppCount > 0 && (
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">🎯 Opportunities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {opportunities.map(opp => (
                    <OpportunityCard
                      key={opp.id}
                      opportunity={opp}
                      onSave={() => handleSave(opp.id)}
                      saved={saved.has(opp.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Courses */}
            {(activeTab === 'all' || activeTab === 'courses') && courseCount > 0 && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">📚 Courses</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {courses.map(course => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      enrolled={false}
                      progress={0}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
