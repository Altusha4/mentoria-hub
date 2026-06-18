import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

/* ═══ Category SVG Icons ═══ */
const TrophyIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const BriefcaseIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const CodeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
  </svg>
);

const AwardIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

const CoinsIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="6" /><path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h1v4" /><path d="m16.71 13.88.7.71-2.82 2.82" />
  </svg>
);

const BookIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const MicIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" />
  </svg>
);

const StarIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const ArrowRightIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

const HeartIcon = ({ className, filled }) => (
  <svg className={className} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const MapPinIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const UsersIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ClockIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

/* Category config */
const CATEGORY_CONFIG = {
  'олимпиада': { icon: TrophyIcon, gradient: 'linear-gradient(135deg, #ffd700, #f0c000)', color: '#ffd700' },
  'стажировка': { icon: BriefcaseIcon, gradient: 'linear-gradient(135deg, #3cc5e0, #2195c4)', color: '#3cc5e0' },
  'хакатон': { icon: CodeIcon, gradient: 'linear-gradient(135deg, #a855f7, #7c3aed)', color: '#a855f7' },
  'конкурс': { icon: AwardIcon, gradient: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#f97316' },
  'стипендия': { icon: CoinsIcon, gradient: 'linear-gradient(135deg, #20c0a0, #1db896)', color: '#20c0a0' },
  'программа': { icon: BookIcon, gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#3b82f6' },
  'конференция': { icon: MicIcon, gradient: 'linear-gradient(135deg, #ec4899, #db2777)', color: '#ec4899' },
};

const DEFAULT_CONFIG = { icon: StarIcon, gradient: 'linear-gradient(135deg, #3cc5e0, #20c0a0)', color: '#3cc5e0' };

export default function OpportunityCard({ opportunity, onSave, saved = false }) {
  const { theme } = useTheme();
  const deadline = new Date(opportunity.deadline);
  const daysLeft = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysLeft <= 7;
  const isExpired = daysLeft <= 0;

  const config = CATEGORY_CONFIG[opportunity.category] || DEFAULT_CONFIG;
  const CategoryIcon = config.icon;

  return (
    <div className={`group relative rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-400 hover:-translate-y-1.5
      ${theme === 'dark'
        ? 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.14] hover:shadow-[0_8px_40px_rgba(60,197,224,0.08)]'
        : 'bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200'
      }`}
    >
      {/* Card Header */}
      <div className="relative p-6 pb-4">
        {/* Category icon + Save */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
            style={{ background: config.gradient }}>
            <CategoryIcon className="w-5.5 h-5.5 text-white" />
          </div>

          <button
            onClick={(e) => { e.preventDefault(); onSave(); }}
            className={`p-2 rounded-lg transition-all duration-200
              ${saved
                ? 'text-rose-500'
                : theme === 'dark'
                  ? 'text-gray-500 hover:text-rose-400 hover:bg-white/[0.06]'
                  : 'text-gray-300 hover:text-rose-400 hover:bg-gray-50'
              }`}
            title={saved ? 'Remove from saved' : 'Save opportunity'}
          >
            <HeartIcon className="w-5 h-5" filled={saved} />
          </button>
        </div>

        {/* Title */}
        <h3 className={`font-bold text-base mb-2 line-clamp-2 leading-snug transition-colors duration-200
          ${theme === 'dark'
            ? 'text-white group-hover:text-[#3cc5e0]'
            : 'text-gray-900 group-hover:text-[#2195c4]'
          }`}
        >
          {opportunity.title}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded-full transition-colors
            ${theme === 'dark'
              ? 'bg-white/[0.06] text-gray-300'
              : 'bg-gray-50 text-gray-600'
            }`}
            style={{ borderLeft: `2px solid ${config.color}` }}
          >
            {opportunity.category}
          </span>
          <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded-full
            ${theme === 'dark'
              ? 'bg-white/[0.06] text-gray-300'
              : 'bg-gray-50 text-gray-600'
            }`}
          >
            {opportunity.direction}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="flex-1 px-6">
        <p className={`text-sm leading-relaxed line-clamp-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          {opportunity.description}
        </p>
      </div>

      {/* Details */}
      <div className={`mx-6 mt-4 pt-4 space-y-2.5 border-t ${theme === 'dark' ? 'border-white/[0.06]' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <span className={`flex items-center gap-2 text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            <MapPinIcon className="w-3.5 h-3.5" />
            Format
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-md
            ${theme === 'dark' ? 'bg-white/[0.06] text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
            {opportunity.format}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`flex items-center gap-2 text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            <UsersIcon className="w-3.5 h-3.5" />
            Grade
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-md
            ${theme === 'dark' ? 'bg-white/[0.06] text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
            {opportunity.grade_level}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`flex items-center gap-2 text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            <ClockIcon className="w-3.5 h-3.5" />
            Deadline
          </span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
            isExpired
              ? 'bg-red-500/10 text-red-400'
              : isUrgent
                ? (theme === 'dark' ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600')
                : (theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600')
          }`}>
            {isExpired ? 'Expired' : `${daysLeft} days left`}
          </span>
        </div>
      </div>

      {/* CTA Button */}
      <div className="p-6 pt-5">
        <Link
          to={`/opportunities/${opportunity.id}`}
          className="group/btn flex items-center justify-center gap-2 w-full py-3 text-white font-semibold text-sm rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
          style={{ background: config.gradient }}
        >
          Learn More
          <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
