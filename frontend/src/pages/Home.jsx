import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useTheme } from '../context/ThemeContext';

/* ═══ Inline SVG Icons ═══ */
const TargetIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
    <line x1="12" y1="2" x2="12" y2="4" />
    <line x1="12" y1="20" x2="12" y2="22" />
    <line x1="2" y1="12" x2="4" y2="12" />
    <line x1="20" y1="12" x2="22" y2="12" />
  </svg>
);

const BookOpenIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const StarIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const ArrowRightIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const SparkleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41L12 0Z" />
  </svg>
);

/* ═══ Animated Counter ═══ */
function AnimatedCount({ target, suffix = '' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const numTarget = parseInt(target) || 0;
    if (numTarget === 0) return;

    let start = 0;
    const duration = 1800;
    const step = Math.ceil(numTarget / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= numTarget) {
        setCount(numTarget);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target]);

  return <>{count}{suffix}</>;
}

/* ═══ Stats Card ═══ */
function StatCard({ icon: Icon, title, desc, count, suffix, gradient, delay, theme }) {
  return (
    <div
      className={`mentoria-fadeInUp ${delay} group relative overflow-hidden rounded-2xl p-7 cursor-default
        transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1
        ${theme === 'dark'
          ? 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.15]'
          : 'bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200'
        }`}
    >
      {/* Hover glow overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${gradient.split(',')[0].replace('linear-gradient(135deg, ', '')}15, transparent 70%)`
        }}
      />

      {/* Icon */}
      <div
        className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
        style={{ background: gradient }}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>

      {/* Content */}
      <h3 className={`font-semibold text-lg mb-1 transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h3>
      <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
        {desc}
      </p>

      {/* Count */}
      <div
        className="text-3xl font-bold bg-clip-text text-transparent"
        style={{ backgroundImage: gradient }}
      >
        <AnimatedCount target={count} suffix={suffix} />
      </div>
    </div>
  );
}

/* ═══ Main Home Component ═══ */
export default function Home({ studentId }) {
  const { theme } = useTheme();
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
    <div className={`transition-colors duration-300 ${theme === 'dark' ? 'bg-[#060d18]' : 'bg-white'}`}>

      {/* ════════ HERO SECTION ════════ */}
      <section className="relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8">
        {/* Background gradient — matching Welcome page */}
        <div className="absolute inset-0" style={{
          background: theme === 'dark'
            ? 'linear-gradient(135deg, #0a1628 0%, #001a35 40%, #0f1f2e 70%, #0a1628 100%)'
            : 'linear-gradient(135deg, #0c1e3a 0%, #0d2847 40%, #143352 70%, #0c1e3a 100%)'
        }} />

        {/* Animated orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full mentoria-orbFloat opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #3cc5e0 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full mentoria-orbFloat opacity-15 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #20c0a0 0%, transparent 70%)', animationDelay: '5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full mentoria-orbFloat opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #2195c4 0%, transparent 70%)', animationDelay: '10s' }} />

        {/* Content */}
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

            {/* Left — Text */}
            <div className="mentoria-fadeInUp">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.08] border border-white/[0.12] backdrop-blur-sm mb-8">
                <SparkleIcon className="w-4 h-4 text-[#3cc5e0]" />
                <span className="text-sm font-medium text-[#b0e0f0]">Your personalized learning platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
                Welcome back,{' '}
                <span className="bg-clip-text text-transparent" style={{
                  backgroundImage: 'linear-gradient(135deg, #3cc5e0, #20c0a0)',
                }}>
                  {studentName}!
                </span>
              </h1>

              <p className="text-lg text-[#8bb8cc] mb-10 leading-relaxed max-w-lg">
                Discover opportunities tailored to your interests and continue your learning journey with personalized courses.
              </p>

              {/* Mini Stats */}
              <div className="flex gap-4 mb-10">
                <div className="flex-1 bg-white/[0.06] backdrop-blur-md rounded-xl p-4 border border-white/[0.1] transition-all duration-300 hover:bg-white/[0.1]">
                  <div className="text-2xl font-bold text-[#ffd700] mb-1">
                    <AnimatedCount target={enrolledCount} />
                  </div>
                  <div className="text-xs text-[#8bb8cc] font-medium uppercase tracking-wider">Courses Enrolled</div>
                </div>
                <div className="flex-1 bg-white/[0.06] backdrop-blur-md rounded-xl p-4 border border-white/[0.1] transition-all duration-300 hover:bg-white/[0.1]">
                  <div className="text-2xl font-bold text-[#ffd700] mb-1">
                    <AnimatedCount target={saved.size} />
                  </div>
                  <div className="text-xs text-[#8bb8cc] font-medium uppercase tracking-wider">Saved Opportunities</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/opportunities"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#0a1628] font-bold rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-[1.03]"
                >
                  Browse Opportunities
                  <ArrowRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/courses"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 font-bold rounded-xl border border-white/20 text-white transition-all duration-300 hover:bg-white/[0.08] hover:border-white/30 hover:scale-[1.03]"
                  style={{ background: 'linear-gradient(135deg, rgba(60,197,224,0.15), rgba(32,192,160,0.15))' }}
                >
                  View Courses
                  <ArrowRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Right — Logo showcase */}
            <div className="hidden md:flex justify-center items-center">
              <div className="relative">
                {/* Glow rings */}
                <div className="absolute inset-0 -m-8 rounded-full opacity-30 blur-2xl mentoria-glow pointer-events-none"
                  style={{ background: 'radial-gradient(circle, #3cc5e0 0%, #20c0a0 50%, transparent 70%)' }} />
                <div className="absolute inset-0 -m-16 rounded-full opacity-15 blur-3xl pointer-events-none"
                  style={{ background: 'radial-gradient(circle, #2195c4 0%, transparent 60%)', animation: 'mentoria-glow 4s ease-in-out infinite reverse' }} />

                {/* Logo container */}
                <div className="relative mentoria-float">
                  <div className="w-72 h-72 lg:w-80 lg:h-80 rounded-3xl flex items-center justify-center overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, rgba(60,197,224,0.12), rgba(32,192,160,0.08))',
                      border: '1px solid rgba(60,197,224,0.2)',
                      backdropFilter: 'blur(20px)',
                    }}>
                    <img
                      src="/logo.png"
                      alt="Mentoria Hub"
                      className="w-56 h-56 lg:w-64 lg:h-64 object-contain mentoria-glow"
                    />
                  </div>

                  {/* Decorative sparkles */}
                  <SparkleIcon className="absolute -top-3 -right-3 w-6 h-6 text-[#3cc5e0] opacity-60" style={{ animation: 'mentoria-float 3s ease-in-out infinite', animationDelay: '0.5s' }} />
                  <SparkleIcon className="absolute -bottom-2 -left-4 w-4 h-4 text-[#20c0a0] opacity-50" style={{ animation: 'mentoria-float 3.5s ease-in-out infinite', animationDelay: '1s' }} />
                  <SparkleIcon className="absolute top-1/2 -right-6 w-3 h-3 text-[#ffd700] opacity-40" style={{ animation: 'mentoria-float 2.8s ease-in-out infinite', animationDelay: '1.5s' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ STATS SECTION ════════ */}
      <section className={`py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300
        ${theme === 'dark' ? 'bg-[#060d18]' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-12 mentoria-fadeInUp">
            <h2 className={`text-3xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Platform at a Glance
            </h2>
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Everything you need to grow, all in one place
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={TargetIcon}
              title="Opportunities"
              desc="Discover scholarships, internships & more"
              count="100"
              suffix="+"
              gradient="linear-gradient(135deg, #3cc5e0, #2195c4)"
              delay="mentoria-delay-1"
              theme={theme}
            />
            <StatCard
              icon={BookOpenIcon}
              title="Courses"
              desc="Learn new skills at your own pace"
              count="30"
              suffix="+"
              gradient="linear-gradient(135deg, #20c0a0, #1db896)"
              delay="mentoria-delay-2"
              theme={theme}
            />
            <StatCard
              icon={StarIcon}
              title="Quality"
              desc="Expert-curated content you can trust"
              count="5"
              suffix="★"
              gradient="linear-gradient(135deg, #ffd700, #f0c000)"
              delay="mentoria-delay-3"
              theme={theme}
            />
          </div>
        </div>
      </section>

      {/* ════════ CTA SECTION ════════ */}
      <section className={`py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300 relative overflow-hidden
        ${theme === 'dark' ? 'bg-[#060d18]' : 'bg-white'}`}>

        {/* Subtle background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-[0.04] blur-3xl"
            style={{ background: theme === 'dark'
              ? 'radial-gradient(ellipse, #3cc5e0, transparent)'
              : 'radial-gradient(ellipse, #2195c4, transparent)'
            }} />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 mentoria-fadeInUp">
          <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Ready to explore more?
          </h2>
          <p className={`text-lg mb-10 max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Check out our full catalog of opportunities and courses to find what interests you most.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/opportunities"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-white font-bold rounded-xl transition-all duration-300 hover:scale-[1.03] hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #3cc5e0, #2195c4)' }}
            >
              All Opportunities
              <ArrowRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/courses"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-white font-bold rounded-xl transition-all duration-300 hover:scale-[1.03] hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #20c0a0, #1db896)' }}
            >
              All Courses
              <ArrowRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/updates"
              className={`group inline-flex items-center justify-center gap-2 px-8 py-4 font-bold rounded-xl transition-all duration-300 hover:scale-[1.03] border
                ${theme === 'dark'
                  ? 'text-white border-white/20 hover:bg-white/[0.06] hover:border-white/30'
                  : 'text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
            >
              Latest Updates
              <ArrowRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
