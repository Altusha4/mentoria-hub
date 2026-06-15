import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import CourseCard from '../components/CourseCard';

export default function Courses({ studentId }) {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (studentId) {
      fetchEnrolledCourses();
    }
  }, [studentId]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await api.getCourses();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      const data = await api.getEnrolledCourses(studentId);
      const enrolled = {};
      data.forEach(enrollment => {
        enrolled[enrollment.course.id] = {
          progress: enrollment.progress,
          enrollmentId: enrollment.id,
        };
      });
      setEnrolledCourses(enrolled);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-12">Our Courses</h1>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading courses...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              enrolled={!!enrolledCourses[course.id]}
              progress={enrolledCourses[course.id]?.progress || 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
