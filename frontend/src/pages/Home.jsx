import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';

export default function Home({ studentId }) {
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(new Set());
  const [enrolledCount, setEnrolledCount] = useState(0);

  useEffect(() => {
    fetchData();
    setStudentName(sessionStorage.getItem('studentName') || 'Student');
  }, [studentId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [enrolled, savedOpp] = await Promise.all([
        api.getEnrolledCourses(studentId),
        api.getSavedOpportunities(studentId),
      ]);
      setEnrolledCount(enrolled.length);
      const savedIds = new Set(savedOpp.map(item => item.opportunity.id));
      setSaved(savedIds);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 dark:from-blue-900 dark:via-blue-950 dark:to-indigo-950 text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-1"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-1"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-6">
                <img src="/logo.png" alt="Mentoria Logo" className="w-14 h-14 object-contain" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Welcome back, <span className="bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">{studentName}!</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Discover opportunities tailored to your interests and continue your learning journey with personalized courses.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-4 border border-white border-opacity-20">
                  <div className="text-3xl font-bold text-yellow-300">{enrolledCount}</div>
                  <div className="text-blue-100 text-sm">Courses Enrolled</div>
                </div>
                <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-4 border border-white border-opacity-20">
                  <div className="text-3xl font-bold text-yellow-300">{saved.size}</div>
                  <div className="text-blue-100 text-sm">Saved Opportunities</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/opportunities"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg"
                >
                  Browse Opportunities →
                </Link>
                <Link
                  to="/courses"
                  className="inline-flex items-center justify-center px-8 py-4 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 border-2 border-white border-opacity-30"
                >
                  View Courses →
                </Link>
              </div>
            </div>

            {/* Illustration area */}
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-3xl opacity-10 blur-3xl"></div>
                <div className="relative bg-gradient-to-br from-blue-400 to-indigo-600 rounded-3xl p-12 text-center">
                  <div className="text-8xl mb-4 animate-bounce">📚</div>
                  <div className="text-2xl font-bold">Your Learning Hub</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '🎯', title: 'Opportunities', desc: 'Discover new chances', count: '100+' },
              { icon: '📖', title: 'Courses', desc: 'Learn new skills', count: '30+' },
              { icon: '⭐', title: 'Quality', desc: 'Expert-curated', count: '5★' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl dark:hover:shadow-blue-900/30 transition-all">
                <div className="text-4xl mb-3">{stat.icon}</div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">{stat.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{stat.desc}</p>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stat.count}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 dark:from-gray-900 to-indigo-50 dark:to-gray-800 transition-colors duration-300">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Ready to explore more?</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
            Check out our full catalog of opportunities and courses to find what interests you most.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/opportunities"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-lg"
            >
              All Opportunities →
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center justify-center px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all shadow-lg"
            >
              All Courses →
            </Link>
            <Link
              to="/updates"
              className="inline-flex items-center justify-center px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all shadow-lg"
            >
              Latest Updates →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
