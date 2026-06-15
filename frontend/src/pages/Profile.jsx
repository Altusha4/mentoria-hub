import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import CourseCard from '../components/CourseCard';
import OpportunityCard from '../components/OpportunityCard';

export default function Profile({ studentId }) {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [savedOpportunities, setSavedOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      fetchUserData();
    }
  }, [studentId]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const [coursesData, opportunitiesData] = await Promise.all([
        api.getEnrolledCourses(studentId),
        api.getSavedOpportunities(studentId),
      ]);
      setEnrolledCourses(coursesData);
      setSavedOpportunities(opportunitiesData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!studentId) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">My Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Please login to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-500 dark:from-blue-900 to-blue-600 dark:to-blue-950 text-white p-8 rounded-lg mb-12">
        <h1 className="text-4xl font-bold mb-2">My Profile</h1>
        <p className="text-blue-100 dark:text-blue-300">Student ID: {studentId}</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Loading profile...</p>
        </div>
      ) : (
        <>
          {/* My Courses Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Courses</h2>
            {enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {enrolledCourses.map(enrollment => (
                  <CourseCard
                    key={enrollment.course.id}
                    course={enrollment.course}
                    enrolled={true}
                    progress={enrollment.progress}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center">
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">You haven't enrolled in any courses yet</p>
                <a href="/courses" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                  Explore courses →
                </a>
              </div>
            )}
          </div>

          {/* Saved Opportunities Section */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Saved Opportunities</h2>
            {savedOpportunities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedOpportunities.map(saved => (
                  <OpportunityCard
                    key={saved.opportunity.id}
                    opportunity={saved.opportunity}
                    onSave={() => {}}
                    saved={true}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center">
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">You haven't saved any opportunities yet</p>
                <a href="/opportunities" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                  Find opportunities →
                </a>
              </div>
            )}
          </div>
        </>
      )}
      </div>
    </div>
  );
}
