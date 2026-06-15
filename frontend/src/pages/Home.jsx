import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import OpportunityCard from '../components/OpportunityCard';
import CourseCard from '../components/CourseCard';

export default function Home({ studentId }) {
  const [recommendedOpportunities, setRecommendedOpportunities] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(new Set());

  useEffect(() => {
    fetchRecommendations();
    fetchSavedOpportunities();
    setStudentName(sessionStorage.getItem('studentName') || 'Student');
  }, [studentId]);

  const fetchSavedOpportunities = async () => {
    try {
      const data = await api.getSavedOpportunities(studentId);
      const savedIds = new Set(data.map(item => item.opportunity.id));
      setSaved(savedIds);
    } catch (error) {
      console.error('Error fetching saved opportunities:', error);
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

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const [opportunities, courses] = await Promise.all([
        api.getRecommendedOpportunities(studentId),
        api.getRecommendedCourses(studentId),
      ]);
      setRecommendedOpportunities(opportunities.slice(0, 3));
      setRecommendedCourses(courses.slice(0, 3));
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <img src="/logo.png" alt="Mentoria Logo" className="w-16 h-16 mx-auto mb-4 object-contain" />
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Welcome back, {studentName}! 👋
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Here are opportunities and courses tailored to your interests. Ready to discover something new?
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/opportunities"
              className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors text-center"
            >
              Browse All Opportunities
            </Link>
            <Link
              to="/courses"
              className="inline-block px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              View All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Recommended Section */}
      {loading ? (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="text-center">
            <p className="text-gray-500">Loading recommendations...</p>
          </div>
        </section>
      ) : (
        <>
          {/* Recommended Opportunities */}
          <section className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">🎯 Opportunities For You</h2>
              {recommendedOpportunities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                <p className="text-gray-600">No opportunities match your interests yet.</p>
              )}
              <Link to="/opportunities" className="text-blue-600 hover:text-blue-700 font-medium">
                View all opportunities →
              </Link>
            </div>
          </section>

          {/* Recommended Courses */}
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">📚 Recommended Courses</h2>
              {recommendedCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
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
                <p className="text-gray-600">No courses available yet.</p>
              )}
              <Link to="/courses" className="text-blue-600 hover:text-blue-700 font-medium">
                View all courses →
              </Link>
            </div>
          </section>
        </>
      )}

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Mentoria Hub?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎯',
                title: 'Find Opportunities',
                description: 'Discover olympiads, internships, scholarships, and competitions suited to your interests and grade level.',
              },
              {
                icon: '📚',
                title: 'Learn Asynchronously',
                description: 'Take courses at your own pace with video lessons, materials, and mini-tests. No fixed schedules.',
              },
              {
                icon: '📊',
                title: 'Track Progress',
                description: 'Monitor your learning with progress bars, saved opportunities, and personalized recommendations.',
              },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-lg border border-gray-200 text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-blue-600 rounded-lg p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-lg text-blue-100 mb-8">
            Join hundreds of students exploring opportunities and learning valuable skills.
          </p>
          <Link
            to="/opportunities"
            className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
}
