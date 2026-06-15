import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import OpportunityCard from '../components/OpportunityCard';
import CourseCard from '../components/CourseCard';
import SmartRecommendations from '../components/SmartRecommendations';

export default function Home({ studentId }) {
  const [recommendedOpportunities, setRecommendedOpportunities] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
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
      const [opportunities, courses, enrolled] = await Promise.all([
        api.getRecommendedOpportunities(studentId),
        api.getRecommendedCourses(studentId),
        api.getEnrolledCourses(studentId),
      ]);
      setRecommendedOpportunities(opportunities.slice(0, 3));
      setRecommendedCourses(courses.slice(0, 3));
      setEnrolledCount(enrolled.length);

      const savedOpp = await api.getSavedOpportunities(studentId);
      const savedIds = new Set(savedOpp.map(item => item.opportunity.id));
      setSaved(savedIds);
    } catch (error) {
      console.error('Error fetching data:', error);
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

      {/* Smart Recommendations */}
      <SmartRecommendations studentId={studentId} studentInterests={sessionStorage.getItem('studentInterests')} />

      {/* Recommended Opportunities */}
      {!loading && (
        <>
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 dark:text-white">For You</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Opportunities matching your interests</p>
                </div>
                <Link to="/opportunities" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-lg">
                  See all →
                </Link>
              </div>
              {recommendedOpportunities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendedOpportunities.map(opp => (
                    <OpportunityCard
                      key={opp.id}
                      opportunity={opp}
                      onSave={() => handleSave(opp.id)}
                      saved={saved.has(opp.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-gradient-to-br from-blue-50 dark:from-gray-800 to-indigo-50 dark:to-gray-900 rounded-xl p-12 text-center border-2 border-dashed border-blue-200 dark:border-gray-700">
                  <div className="text-5xl mb-4">🔍</div>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">No opportunities match your interests yet.</p>
                  <Link to="/opportunities" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold mt-4 inline-block">
                    Explore all opportunities →
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* Recommended Courses */}
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Recommended Courses</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Continue learning at your own pace</p>
                </div>
                <Link to="/courses" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-lg">
                  See all →
                </Link>
              </div>
              {recommendedCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {recommendedCourses.map(course => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      enrolled={false}
                      progress={0}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                  <div className="text-5xl mb-4">📚</div>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">No courses available yet.</p>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {loading && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-block">
              <div className="text-5xl mb-4 animate-bounce">⏳</div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Loading your personalized content...</p>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">Why Choose Mentoria Hub?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎯',
                title: 'Find Your Path',
                description: 'Discover olympiads, internships, scholarships, and competitions suited to your interests and grade level.',
              },
              {
                icon: '⏰',
                title: 'Learn at Your Pace',
                description: 'Take courses asynchronously with video lessons, materials, and mini-tests. No fixed schedules or time pressure.',
              },
              {
                icon: '📊',
                title: 'Track Your Growth',
                description: 'Monitor your progress with detailed analytics, achievements, and personalized recommendations.',
              },
            ].map((feature, idx) => (
              <div key={idx} className="group bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-2xl dark:hover:shadow-blue-900/30 transition-all hover:border-blue-200 dark:hover:border-blue-700 hover:-translate-y-2">
                <div className="text-5xl mb-4 group-hover:scale-125 transition-transform">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-900 rounded-3xl p-12 md:p-16 text-center text-white overflow-hidden transition-colors duration-300">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-10 -z-1"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Future?</h2>
              <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                Join thousands of students who are already discovering opportunities and mastering new skills with Mentoria Hub.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/opportunities"
                  className="inline-flex items-center justify-center px-10 py-4 bg-white text-blue-600 dark:text-blue-700 font-bold rounded-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl"
                >
                  Explore Opportunities
                </Link>
                <Link
                  to="/courses"
                  className="inline-flex items-center justify-center px-10 py-4 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-700 transition-all border-2 border-white border-opacity-30"
                >
                  Start Learning
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
