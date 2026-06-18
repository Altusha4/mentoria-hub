import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import OpportunityCard from '../components/OpportunityCard';

/* ═══ SVG Icons ═══ */
const FilterIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const SparkleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41L12 0Z" />
  </svg>
);

const ChevronDownIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const SearchIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

/* ═══ Loading Skeleton ═══ */
function CardSkeleton({ theme }) {
  return (
    <div className={`rounded-2xl overflow-hidden animate-pulse ${
      theme === 'dark' ? 'bg-white/[0.04]' : 'bg-gray-100'
    }`}>
      <div className={`h-32 ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-gray-200'}`} />
      <div className="p-6 space-y-3">
        <div className={`h-5 rounded-lg w-3/4 ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-gray-200'}`} />
        <div className={`h-4 rounded-lg w-full ${theme === 'dark' ? 'bg-white/[0.04]' : 'bg-gray-150'}`} />
        <div className={`h-4 rounded-lg w-2/3 ${theme === 'dark' ? 'bg-white/[0.04]' : 'bg-gray-150'}`} />
        <div className="pt-4 flex gap-2">
          <div className={`h-8 rounded-full w-20 ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-gray-200'}`} />
          <div className={`h-8 rounded-full w-16 ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-gray-200'}`} />
        </div>
      </div>
    </div>
  );
}

/* ═══ Custom Select ═══ */
function FilterSelect({ value, onChange, label, options, theme }) {
  return (
    <div className="relative group">
      <select
        value={value}
        onChange={onChange}
        className={`w-full appearance-none pl-4 pr-10 py-3 rounded-xl text-sm font-medium transition-all duration-200 outline-none cursor-pointer
          ${theme === 'dark'
            ? 'bg-white/[0.06] border border-white/[0.1] text-white hover:bg-white/[0.1] focus:border-[#3cc5e0]/50 focus:bg-white/[0.08]'
            : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300 focus:border-[#3cc5e0] focus:shadow-[0_0_0_3px_rgba(60,197,224,0.1)]'
          }`}
      >
        <option value="" className={theme === 'dark' ? 'bg-[#0f1a2e] text-gray-300' : 'bg-white text-gray-700'}>
          {label}
        </option>
        {options.map(option => (
          <option key={option} value={option} className={theme === 'dark' ? 'bg-[#0f1a2e] text-white' : 'bg-white text-gray-900'}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDownIcon className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors
        ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}
      />
    </div>
  );
}

/* ═══ Main Opportunities Page ═══ */
export default function Opportunities({ studentId }) {
  const { theme } = useTheme();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(new Set());

  const [filters, setFilters] = useState({
    category: '',
    direction: '',
    format: '',
    grade_level: '',
  });

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

  useEffect(() => {
    fetchOpportunities();
  }, [filters]);

  useEffect(() => {
    if (studentId) {
      fetchSavedOpportunities();
    }
  }, [studentId]);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const data = await api.getOpportunities(filters);
      setOpportunities(data);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

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
    if (!studentId) {
      alert('Please login first');
      return;
    }

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

  const clearFilters = () => {
    setFilters({ category: '', direction: '', format: '', grade_level: '' });
  };

  const categories = ['олимпиада', 'стажировка', 'хакатон', 'конкурс', 'стипендия', 'программа', 'конференция'];
  const directions = ['STEM', 'Business', 'Finance', 'Programming', 'Science', 'Social Impact'];
  const formats = ['online', 'offline', 'hybrid'];
  const grades = ['8-9', '9-11', '10-11', '8-11'];

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

        {/* Animated orbs */}
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full mentoria-orbFloat opacity-15 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #3cc5e0 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-1/3 w-[350px] h-[350px] rounded-full mentoria-orbFloat opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #20c0a0 0%, transparent 70%)', animationDelay: '7s' }} />

        {/* Content */}
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mentoria-fadeInUp">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.08] border border-white/[0.12] backdrop-blur-sm mb-6">
              <SparkleIcon className="w-3.5 h-3.5 text-[#3cc5e0]" />
              <span className="text-sm font-medium text-[#b0e0f0]">Discover your next opportunity</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight">
              Education{' '}
              <span className="bg-clip-text text-transparent" style={{
                backgroundImage: 'linear-gradient(135deg, #3cc5e0, #20c0a0)',
              }}>
                Opportunities
              </span>
            </h1>

            <p className="text-lg text-[#8bb8cc] max-w-2xl leading-relaxed">
              Browse scholarships, internships, olympiads, hackathons and more — all curated for ambitious students.
            </p>

            {/* Results count */}
            {!loading && (
              <div className="mt-6 flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.1]">
                  <SearchIcon className="w-4 h-4 text-[#3cc5e0]" />
                  <span className="text-sm font-medium text-white">{opportunities.length}</span>
                  <span className="text-sm text-[#8bb8cc]">opportunities found</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ════════ FILTERS + CONTENT ════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Filters Bar */}
        <div className={`rounded-2xl p-5 mb-8 mentoria-fadeInUp mentoria-delay-1 transition-colors duration-300
          ${theme === 'dark'
            ? 'bg-white/[0.03] border border-white/[0.06]'
            : 'bg-white border border-gray-100 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FilterIcon className={`w-4.5 h-4.5 ${theme === 'dark' ? 'text-[#3cc5e0]' : 'text-[#2195c4]'}`} />
              <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                Filters
              </span>
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #3cc5e0, #20c0a0)' }}>
                  {activeFilterCount}
                </span>
              )}
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors
                  ${theme === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-white/[0.06]'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
              >
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <FilterSelect
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              label="Category"
              options={categories}
              theme={theme}
            />
            <FilterSelect
              value={filters.direction}
              onChange={(e) => setFilters({ ...filters, direction: e.target.value })}
              label="Direction"
              options={directions}
              theme={theme}
            />
            <FilterSelect
              value={filters.format}
              onChange={(e) => setFilters({ ...filters, format: e.target.value })}
              label="Format"
              options={formats}
              theme={theme}
            />
            <FilterSelect
              value={filters.grade_level}
              onChange={(e) => setFilters({ ...filters, grade_level: e.target.value })}
              label="Grade Level"
              options={grades}
              theme={theme}
            />
          </div>
        </div>

        {/* ════════ OPPORTUNITIES GRID ════════ */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <CardSkeleton key={i} theme={theme} />
            ))}
          </div>
        ) : opportunities.length === 0 ? (
          /* Empty State */
          <div className={`text-center py-20 rounded-2xl transition-colors ${
            theme === 'dark' ? 'bg-white/[0.02]' : 'bg-white'
          }`}>
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(60,197,224,0.1), rgba(32,192,160,0.1))' }}>
              <SearchIcon className="w-10 h-10 text-[#3cc5e0] opacity-60" />
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              No opportunities found
            </h3>
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Try adjusting your filters to discover more opportunities.
            </p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.03]"
              style={{ background: 'linear-gradient(135deg, #3cc5e0, #2195c4)' }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opportunity, index) => (
              <div
                key={opportunity.id}
                className="mentoria-fadeInUp"
                style={{ animationDelay: `${Math.min(index * 0.05, 0.4)}s`, opacity: 0 }}
              >
                <OpportunityCard
                  opportunity={opportunity}
                  onSave={() => handleSave(opportunity.id)}
                  saved={saved.has(opportunity.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
