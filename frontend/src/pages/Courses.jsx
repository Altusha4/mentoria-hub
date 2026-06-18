import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { api } from '../utils/api';
import CourseCard from '../components/CourseCard';

/* ═══ SVG Icons ═══ */
const GraduationCapIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5" />
  </svg>
);

const SparkleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41L12 0Z" />
  </svg>
);

const LayersIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

/* ═══ Filter Chip ═══ */
function FilterChip({ label, active, onClick, theme }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap
        ${active
          ? 'text-white shadow-md'
          : theme === 'dark'
            ? 'bg-white/[0.04] text-gray-400 border border-white/[0.08] hover:bg-white/[0.08] hover:text-white'
            : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 hover:text-gray-700'
        }`}
      style={active ? { background: 'linear-gradient(135deg, #3cc5e0, #20c0a0)' } : {}}
    >
      {label}
    </button>
  );
}

/* ═══ Skeleton ═══ */
function CourseSkeleton({ theme }) {
  return (
    <div className={`rounded-2xl overflow-hidden animate-pulse ${theme === 'dark' ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-white border border-gray-100'}`}>
      <div className={`h-44 ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-gray-100'}`} />
      <div className="p-6 space-y-3">
        <div className={`h-5 rounded-lg w-3/4 ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-gray-200'}`} />
        <div className={`h-4 rounded-lg w-full ${theme === 'dark' ? 'bg-white/[0.04]' : 'bg-gray-100'}`} />
        <div className={`h-4 rounded-lg w-1/2 ${theme === 'dark' ? 'bg-white/[0.04]' : 'bg-gray-100'}`} />
        <div className="pt-4 flex gap-2">
          <div className={`h-8 rounded-full w-24 ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-gray-100'}`} />
          <div className={`h-8 rounded-full w-20 ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-gray-100'}`} />
        </div>
      </div>
    </div>
  );
}

/* ═══ Main Component ═══ */
export default function Courses({ studentId }) {
  const { theme } = useTheme();
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

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

  // Filter courses
  const filteredCourses = courses.filter(course => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'enrolled') return !!enrolledCourses[course.id];
    return course.difficulty_level === activeFilter;
  });

  const enrolledCount = Object.keys(enrolledCourses).length;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-[#060d18]' : 'bg-gray-50'}`}>

      {/* ════════ HERO HEADER ════════ */}
      <section className="relative overflow-hidden py-16 px-4 sm:px-6 lg:px-8">
        {/* Background */}
        <div className="absolute inset-0" style={{
          background: theme === 'dark'
            ? 'linear-gradient(135deg, #0a1628 0%, #001a35 40%, #0f1f2e 70%, #0a1628 100%)'
            : 'linear-gradient(135deg, #0c1e3a 0%, #0d2847 40%, #143352 70%, #0c1e3a 100%)'
        }} />

        {/* Orbs */}
        <div className="absolute top-0 left-1/3 w-[400px] h-[400px] rounded-full mentoria-orbFloat opacity-15 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #20c0a0 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] rounded-full mentoria-orbFloat opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #3cc5e0 0%, transparent 70%)', animationDelay: '8s' }} />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mentoria-fadeInUp">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.08] border border-white/[0.12] backdrop-blur-sm mb-6">
              <SparkleIcon className="w-3.5 h-3.5 text-[#20c0a0]" />
              <span className="text-sm font-medium text-[#b0e0f0]">Learn at your own pace</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight">
              Our{' '}
              <span className="bg-clip-text text-transparent" style={{
                backgroundImage: 'linear-gradient(135deg, #20c0a0, #3cc5e0)',
              }}>
                Courses
              </span>
            </h1>

            <p className="text-lg text-[#8bb8cc] max-w-2xl leading-relaxed mb-8">
              Master new skills with expert-curated courses designed for ambitious students. Track your progress and learn step by step.
            </p>

            {/* Stats pills */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.1]">
                <LayersIcon className="w-4 h-4 text-[#20c0a0]" />
                <span className="text-sm font-medium text-white">{courses.length}</span>
                <span className="text-sm text-[#8bb8cc]">courses</span>
              </div>
              {enrolledCount > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.1]">
                  <GraduationCapIcon className="w-4 h-4 text-[#ffd700]" />
                  <span className="text-sm font-medium text-white">{enrolledCount}</span>
                  <span className="text-sm text-[#8bb8cc]">enrolled</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ════════ CONTENT ════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2 mb-8 mentoria-fadeInUp mentoria-delay-1">
          {[
            { key: 'all', label: 'All Courses' },
            { key: 'enrolled', label: 'My Courses' },
            { key: 'beginner', label: 'Beginner' },
            { key: 'intermediate', label: 'Intermediate' },
            { key: 'advanced', label: 'Advanced' },
          ].map(filter => (
            <FilterChip
              key={filter.key}
              label={filter.label}
              active={activeFilter === filter.key}
              onClick={() => setActiveFilter(filter.key)}
              theme={theme}
            />
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <CourseSkeleton key={i} theme={theme} />
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          /* Empty State */
          <div className={`text-center py-20 rounded-2xl transition-colors ${
            theme === 'dark' ? 'bg-white/[0.02]' : 'bg-white border border-gray-100'
          }`}>
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(32,192,160,0.1), rgba(60,197,224,0.1))' }}>
              <GraduationCapIcon className="w-10 h-10 text-[#20c0a0] opacity-60" />
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {activeFilter === 'enrolled' ? 'No enrolled courses yet' : 'No courses found'}
            </h3>
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {activeFilter === 'enrolled' 
                ? 'Start exploring courses and enroll to begin your learning journey.'
                : 'Try selecting a different filter.'
              }
            </p>
            {activeFilter !== 'all' && (
              <button
                onClick={() => setActiveFilter('all')}
                className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.03]"
                style={{ background: 'linear-gradient(135deg, #20c0a0, #1db896)' }}
              >
                View All Courses
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredCourses.map((course, index) => (
              <div
                key={course.id}
                className="mentoria-fadeInUp"
                style={{ animationDelay: `${Math.min(index * 0.06, 0.4)}s`, opacity: 0 }}
              >
                <CourseCard
                  course={course}
                  enrolled={!!enrolledCourses[course.id]}
                  progress={enrolledCourses[course.id]?.progress || 0}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
