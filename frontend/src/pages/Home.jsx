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
      <section style={{
        background: 'linear-gradient(to bottom right, #0a1628, #2195c4, #20c0a0)',
      }} className="text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-1" style={{ backgroundColor: '#3cc5e0' }}></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-1" style={{ backgroundColor: '#30d9b8' }}></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-6">
                <img src="/logo.png" alt="Mentoria Logo" className="w-14 h-14 object-contain" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Welcome back, <span style={{
                  background: 'linear-gradient(to right, #3cc5e0, #30d9b8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}>{studentName}!</span>
              </h1>
              <p className="text-xl mb-8 leading-relaxed" style={{ color: '#b0e0f0' }}>
                Discover opportunities tailored to your interests and continue your learning journey with personalized courses.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-4 border border-white border-opacity-20">
                  <div className="text-3xl font-bold" style={{ color: '#ffd700' }}>{enrolledCount}</div>
                  <div className="text-sm" style={{ color: '#b0e0f0' }}>Courses Enrolled</div>
                </div>
                <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-4 border border-white border-opacity-20">
                  <div className="text-3xl font-bold" style={{ color: '#ffd700' }}>{saved.size}</div>
                  <div className="text-sm" style={{ color: '#b0e0f0' }}>Saved Opportunities</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/opportunities"
                  className="inline-flex items-center justify-center px-8 py-4 text-white font-bold rounded-lg hover:opacity-90 transition-all transform hover:scale-105 shadow-lg"
                  style={{ backgroundColor: 'white', color: '#2195c4' }}
                >
                  Browse Opportunities →
                </Link>
                <Link
                  to="/courses"
                  className="inline-flex items-center justify-center px-8 py-4 text-white font-bold rounded-lg hover:opacity-90 transition-all transform hover:scale-105 border-2 border-white border-opacity-30"
                  style={{ backgroundColor: '#3cc5e0' }}
                >
                  View Courses →
                </Link>
              </div>
            </div>

            {/* Illustration area */}
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl opacity-10 blur-3xl" style={{
                  background: 'linear-gradient(to bottom right, #ffd700, #ffb700)'
                }}></div>
                <div className="relative rounded-3xl p-12 text-center" style={{
                  background: 'linear-gradient(to bottom right, #3cc5e0, #20c0a0)'
                }}>
                  <div className="text-8xl mb-4 animate-bounce">📚</div>
                  <div className="text-2xl font-bold">Your Learning Hub</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '🎯', title: 'Opportunities', desc: 'Discover new chances', count: '100+' },
              { icon: '📖', title: 'Courses', desc: 'Learn new skills', count: '30+' },
              { icon: '⭐', title: 'Quality', desc: 'Expert-curated', count: '5★' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-xl transition-all">
                <div className="text-4xl mb-3">{stat.icon}</div>
                <h3 className="font-bold text-gray-900 text-lg">{stat.title}</h3>
                <p className="text-gray-500 text-sm mb-3">{stat.desc}</p>
                <div className="text-2xl font-bold" style={{ color: '#2195c4' }}>{stat.count}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300" style={{
        background: 'linear-gradient(to bottom right, #f0f8fb, #e0f5f2)'
      }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to explore more?</h2>
          <p className="text-gray-600 text-lg mb-8">
            Check out our full catalog of opportunities and courses to find what interests you most.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/opportunities"
              className="inline-flex items-center justify-center px-8 py-4 text-white font-bold rounded-lg hover:opacity-90 transition-all shadow-lg"
              style={{ backgroundColor: '#2195c4' }}
            >
              All Opportunities →
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center justify-center px-8 py-4 text-white font-bold rounded-lg hover:opacity-90 transition-all shadow-lg"
              style={{ backgroundColor: '#20c0a0' }}
            >
              All Courses →
            </Link>
            <Link
              to="/updates"
              className="inline-flex items-center justify-center px-8 py-4 text-white font-bold rounded-lg hover:opacity-90 transition-all shadow-lg"
              style={{ backgroundColor: '#3cc5e0' }}
            >
              Latest Updates →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
