import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useTheme } from '../context/ThemeContext';

/* ═══ SVG Icons ═══ */
const SparklesIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
  </svg>
);

const ArrowRightIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

const BriefcaseIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="7" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const BookIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const TargetIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
);

const MegaphoneIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 11 18-5v12L3 13v-2z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
  </svg>
);

const LightbulbIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" /><path d="M10 22h4" />
  </svg>
);

const StarIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const CATEGORY_CONFIG = {
  hiring: { icon: BriefcaseIcon, gradient: 'linear-gradient(135deg, #3cc5e0, #2195c4)', color: '#3cc5e0' },
  programs: { icon: BookIcon, gradient: 'linear-gradient(135deg, #a855f7, #7c3aed)', color: '#a855f7' },
  opportunities: { icon: TargetIcon, gradient: 'linear-gradient(135deg, #20c0a0, #1db896)', color: '#20c0a0' },
  news: { icon: MegaphoneIcon, gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#3b82f6' },
  tips: { icon: LightbulbIcon, gradient: 'linear-gradient(135deg, #ffd700, #f0c000)', color: '#ffd700' },
  general: { icon: StarIcon, gradient: 'linear-gradient(135deg, #3cc5e0, #20c0a0)', color: '#3cc5e0' },
};

export default function SmartRecommendations({ studentId, studentInterests }) {
  const { theme } = useTheme();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, [studentInterests]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!studentInterests || studentInterests.length === 0) {
        setRecommendations([]);
        return;
      }

      const interests = typeof studentInterests === 'string'
        ? studentInterests.split(',').map(i => i.trim()).filter(Boolean)
        : studentInterests;

      const response = await fetch('http://localhost:8000/api/recommendations/get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interests: interests,
          top_k: 6
        })
      });

      if (!response.ok) throw new Error('Failed to fetch recommendations');
      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className={`py-12 px-4 sm:px-6 lg:px-8 ${theme === 'dark' ? 'bg-[#060d18]' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className={`h-8 rounded-lg w-1/3 mb-8 ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-gray-200'}`} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-48 rounded-2xl ${theme === 'dark' ? 'bg-white/[0.04]' : 'bg-gray-100'}`} />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || recommendations.length === 0) {
    return null;
  }

  return (
    <section className={`py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300
      ${theme === 'dark' ? 'bg-[#060d18]' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 mentoria-fadeInUp">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3cc5e0, #20c0a0)' }}>
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Personalized Recommendations
            </h2>
          </div>
          <p className={`ml-13 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Carefully selected based on your interests
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec, index) => {
            const catConfig = CATEGORY_CONFIG[rec.category] || CATEGORY_CONFIG.general;
            const CatIcon = catConfig.icon;
            const scorePercent = Math.round(rec.score * 100);

            return (
              <div
                key={rec.post_id}
                className={`group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 mentoria-fadeInUp
                  ${theme === 'dark'
                    ? 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.14]'
                    : 'bg-white border border-gray-100 shadow-sm hover:shadow-lg'
                  }`}
                style={{ animationDelay: `${index * 0.1}s`, opacity: 0 }}
              >
                {/* Category & Score */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: catConfig.gradient }}>
                      <CatIcon className="w-4.5 h-4.5 text-white" />
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-md
                      ${theme === 'dark' ? 'bg-white/[0.06] text-gray-300' : 'bg-gray-50 text-gray-600'}`}>
                      {rec.category}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">
                    {scorePercent}% match
                  </span>
                </div>

                {/* Title */}
                <h3 className={`font-semibold mb-4 line-clamp-2 leading-snug
                  ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {rec.title}
                </h3>

                {/* Score Bar */}
                <div className={`w-full h-1.5 rounded-full mb-4 overflow-hidden
                  ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-gray-100'}`}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${scorePercent}%`, background: catConfig.gradient }}
                  />
                </div>

                {/* Footer */}
                <div className={`flex items-center justify-between pt-3 border-t
                  ${theme === 'dark' ? 'border-white/[0.06]' : 'border-gray-100'}`}>
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    Relevance: {scorePercent}%
                  </span>
                  <a
                    href="https://t.me/mentoria_updates"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link flex items-center gap-1 text-xs font-semibold text-[#3cc5e0] hover:text-[#20c0a0] transition-colors"
                  >
                    Learn more
                    <ArrowRightIcon className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center mentoria-fadeInUp" style={{ animationDelay: '0.4s', opacity: 0 }}>
          <Link
            to="/updates"
            className="group inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.03] hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, #3cc5e0, #2195c4)' }}
          >
            View all updates
            <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
