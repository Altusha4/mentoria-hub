import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

/* ═══ SVG Icons ═══ */
const SeedlingIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 20h10" /><path d="M10 20c5.5-2.5.8-6.4 3-10" />
    <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
    <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
  </svg>
);

const TreeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22v-7l-2-2" /><path d="M17 8v.8A6 6 0 0 1 13.8 20H10A6.5 6.5 0 0 1 7 8h0a5 5 0 0 1 10 0Z" />
    <path d="m14 14-2 2" />
  </svg>
);

const RocketIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

const PlayIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const ArrowRightIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

const BookStackIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    <path d="M8 7h6" /><path d="M8 11h8" />
  </svg>
);

const CheckCircleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

/* ═══ Difficulty config ═══ */
const DIFFICULTY_CONFIG = {
  beginner: {
    icon: SeedlingIcon,
    label: 'Beginner',
    gradient: 'linear-gradient(135deg, #20c0a0, #1db896)',
    color: '#20c0a0',
    bgLight: 'bg-emerald-50',
    textLight: 'text-emerald-700',
  },
  intermediate: {
    icon: TreeIcon,
    label: 'Intermediate',
    gradient: 'linear-gradient(135deg, #3cc5e0, #2195c4)',
    color: '#3cc5e0',
    bgLight: 'bg-cyan-50',
    textLight: 'text-cyan-700',
  },
  advanced: {
    icon: RocketIcon,
    label: 'Advanced',
    gradient: 'linear-gradient(135deg, #a855f7, #7c3aed)',
    color: '#a855f7',
    bgLight: 'bg-purple-50',
    textLight: 'text-purple-700',
  },
};

const DEFAULT_DIFFICULTY = DIFFICULTY_CONFIG.beginner;

export default function CourseCard({ course, enrolled = false, progress = 0 }) {
  const { theme } = useTheme();
  const lessonCount = course.lessons?.length || 0;
  const config = DIFFICULTY_CONFIG[course.difficulty_level] || DEFAULT_DIFFICULTY;
  const DifficultyIcon = config.icon;
  const isComplete = progress >= 100;

  return (
    <div className={`group relative rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-400 hover:-translate-y-1.5
      ${theme === 'dark'
        ? 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.14] hover:shadow-[0_8px_40px_rgba(32,192,160,0.06)]'
        : 'bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200'
      }`}
    >
      {/* ═══ Card Header — Visual Area ═══ */}
      <div className="relative h-44 overflow-hidden" style={{ background: config.gradient }}>
        {/* Decorative shapes */}
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/[0.08]" />
        <div className="absolute -bottom-10 -left-6 w-40 h-40 rounded-full bg-white/[0.05]" />
        <div className="absolute top-1/2 right-1/4 w-20 h-20 rounded-full bg-white/[0.04]" />

        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }} />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-between p-6">
          <div className="flex items-start justify-between">
            {/* Lesson count badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.15] backdrop-blur-sm">
              <BookStackIcon className="w-4 h-4 text-white" />
              <span className="text-sm font-bold text-white">{lessonCount} Lessons</span>
            </div>

            {/* Enrolled badge */}
            {enrolled && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg backdrop-blur-sm ${
                isComplete ? 'bg-[#ffd700]/20' : 'bg-white/[0.15]'
              }`}>
                <CheckCircleIcon className={`w-4 h-4 ${isComplete ? 'text-[#ffd700]' : 'text-white'}`} />
                <span className={`text-xs font-bold ${isComplete ? 'text-[#ffd700]' : 'text-white'}`}>
                  {isComplete ? 'Completed' : 'Enrolled'}
                </span>
              </div>
            )}
          </div>

          {/* Big icon in center */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.12] backdrop-blur-sm flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <DifficultyIcon className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Card Body ═══ */}
      <div className="flex-1 p-6 flex flex-col">
        {/* Title */}
        <h3 className={`font-bold text-base mb-2 line-clamp-2 leading-snug transition-colors duration-200
          ${theme === 'dark'
            ? 'text-white group-hover:text-[#20c0a0]'
            : 'text-gray-900 group-hover:text-[#2195c4]'
          }`}
        >
          {course.title}
        </h3>

        {/* Description */}
        <p className={`text-sm leading-relaxed line-clamp-3 flex-1 mb-4
          ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
        >
          {course.description}
        </p>

        {/* Difficulty Badge */}
        <div className="mb-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold
            ${theme === 'dark'
              ? 'bg-white/[0.06] text-gray-300'
              : `${config.bgLight} ${config.textLight}`
            }`}
            style={theme === 'dark' ? { borderLeft: `2px solid ${config.color}` } : {}}
          >
            <DifficultyIcon className="w-3.5 h-3.5" />
            <span className="capitalize">{course.difficulty_level}</span>
          </div>
        </div>

        {/* Progress Bar (if enrolled) */}
        {enrolled && (
          <div className={`pt-4 mb-2 border-t ${theme === 'dark' ? 'border-white/[0.06]' : 'border-gray-100'}`}>
            <div className="flex justify-between items-center mb-2.5">
              <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Progress
              </span>
              <span className="text-xs font-bold bg-clip-text text-transparent"
                style={{ backgroundImage: config.gradient }}>
                {Math.round(progress)}%
              </span>
            </div>
            <div className={`w-full h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-gray-100'}`}>
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.min(progress, 100)}%`, background: config.gradient }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ═══ Card Footer — CTA ═══ */}
      <div className="px-6 pb-6">
        <Link
          to={`/courses/${course.id}`}
          className={`group/btn flex items-center justify-center gap-2 w-full py-3 font-semibold text-sm rounded-xl transition-all duration-300 hover:scale-[1.02]
            ${enrolled
              ? 'text-white hover:shadow-lg'
              : theme === 'dark'
                ? 'text-white hover:shadow-lg'
                : 'text-white hover:shadow-lg'
            }`}
          style={{ background: enrolled && progress > 0
            ? config.gradient
            : 'linear-gradient(135deg, #3cc5e0, #2195c4)'
          }}
        >
          {enrolled ? (
            <>
              <PlayIcon className="w-4 h-4" />
              {isComplete ? 'Review Course' : 'Continue Learning'}
            </>
          ) : (
            <>
              Enroll Now
              <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </>
          )}
        </Link>
      </div>
    </div>
  );
}
