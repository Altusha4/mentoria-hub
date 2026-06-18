import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useTheme } from '../context/ThemeContext';

/* ══ Helper: days left ══════════════════════ */
function getDaysLeft(deadline) {
  if (!deadline) return null;
  return Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
}

function formatDeadline(deadline) {
  if (!deadline) return '—';
  return new Date(deadline).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

/* ══ Category color map ═════════════════════ */
const CAT_COLOR = {
  scholarship: '#3cc5e0',
  internship:  '#20c0a0',
  program:     '#a855f7',
  competition: '#f97316',
  grant:       '#ffd700',
  conference:  '#6366f1',
  default:     '#3cc5e0',
};
function catColor(cat) {
  if (!cat) return CAT_COLOR.default;
  const k = Object.keys(CAT_COLOR).find(k => cat.toLowerCase().includes(k));
  return k ? CAT_COLOR[k] : CAT_COLOR.default;
}

/* ══ Score circle for success chance ═══════ */
function ScoreCircle({ pct }) {
  const r = 48;
  const c = 2 * Math.PI * r;
  const color = pct >= 70 ? '#20c0a0' : pct >= 50 ? '#3cc5e0' : '#f97316';
  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg viewBox="0 0 112 112" className="w-full h-full -rotate-90">
        <circle cx="56" cy="56" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle cx="56" cy="56" r={r} fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black" style={{ color }}>{pct}%</span>
      </div>
    </div>
  );
}

/* ══ Score bar ══════════════════════════════ */
function ScoreBar({ label, value, color, theme }) {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{label}</span>
        <span className="text-xs font-black" style={{ color }}>{pct}%</span>
      </div>
      <div className={`h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-gray-100'}`}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

/* ══ Tag ════════════════════════════════════ */
function Tag({ label, color, theme }) {
  return (
    <span
      className="px-3 py-1.5 rounded-lg text-xs font-bold capitalize"
      style={{ color, background: `${color}14` }}
    >
      {label}
    </span>
  );
}

/* ══ Detail row ═════════════════════════════ */
function DetailRow({ label, value, theme, accent }) {
  return (
    <div className={`flex gap-4 py-4 border-b last:border-0
      ${theme === 'dark' ? 'border-white/[0.05]' : 'border-gray-100'}`}>
      <div className="flex items-start gap-2 w-28 flex-shrink-0 pt-0.5">
        <div className="w-1 h-4 rounded-full mt-0.5 flex-shrink-0" style={{ background: accent }} />
        <span className={`text-xs font-bold uppercase tracking-wider leading-relaxed
          ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
          {label}
        </span>
      </div>
      <span className={`text-sm font-semibold flex-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
        {value || '—'}
      </span>
    </div>
  );
}

/* ══ Success Chance Modal ═══════════════════ */
function ChanceModal({ data, onClose, theme }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const pct = Math.round(data.percentage ?? 0);
  const scoreColor = pct >= 70 ? '#20c0a0' : pct >= 50 ? '#3cc5e0' : '#f97316';
  const scoreLabel = pct >= 70
    ? 'Strong match — go for it!'
    : pct >= 50
      ? 'Moderate match — room to grow'
      : 'Low match — work on requirements';

  const breakdown = [
    { label: 'Skill Match',          value: data.score_breakdown?.skill_match ?? 0,          color: '#3cc5e0' },
    { label: 'Semantic Match',       value: data.score_breakdown?.semantic_match ?? 0,       color: '#a855f7' },
    { label: 'Academic Score',       value: data.score_breakdown?.academic_score ?? 0,       color: '#20c0a0' },
    { label: 'Interest Match',       value: data.score_breakdown?.interest_match ?? 0,       color: '#f97316' },
    { label: 'Profile Completeness', value: data.score_breakdown?.profile_completeness ?? 0, color: '#ffd700' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className={`relative w-full max-w-xl max-h-[88vh] flex flex-col overflow-hidden rounded-2xl shadow-2xl border
          ${theme === 'dark'
            ? 'bg-[#0d1926] border-white/[0.08]'
            : 'bg-white border-gray-100'
          }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="h-[3px]" style={{ background: `linear-gradient(90deg, ${scoreColor}, transparent)` }} />

        {/* Header */}
        <div className={`flex items-center justify-between px-7 py-5 border-b flex-shrink-0
          ${theme === 'dark' ? 'border-white/[0.06]' : 'border-gray-100'}`}>
          <div>
            <p className={`text-xs font-bold uppercase tracking-widest mb-0.5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              AI Analysis
            </p>
            <h2 className={`text-lg font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Success Chance
            </h2>
          </div>
          <button onClick={onClose}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg font-medium transition-colors
              ${theme === 'dark' ? 'text-gray-500 hover:text-white hover:bg-white/[0.06]' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}>
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-7 py-6 space-y-6">

          {/* Score ring */}
          <div className="text-center">
            <ScoreCircle pct={pct} />
            <p className={`mt-4 text-sm font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {scoreLabel}
            </p>
          </div>

          {/* Breakdown */}
          <div className={`rounded-2xl p-5 border ${theme === 'dark' ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-gray-50 border-gray-100'}`}>
            <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              Score Breakdown
            </p>
            <div className="space-y-3.5">
              {breakdown.map(b => (
                <ScoreBar key={b.label} label={b.label} value={b.value} color={b.color} theme={theme} />
              ))}
            </div>
          </div>

          {/* Matching skills */}
          {data.matching_skills?.length > 0 && (
            <div className="rounded-2xl p-5 border" style={{
              background: 'rgba(32,192,160,0.06)', borderColor: 'rgba(32,192,160,0.2)'
            }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3 text-[#20c0a0]">
                Matching Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {data.matching_skills.map(s => (
                  <span key={s} className="px-3 py-1 rounded-lg text-xs font-bold text-[#20c0a0]"
                    style={{ background: 'rgba(32,192,160,0.12)' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing skills */}
          {data.missing_skills?.length > 0 && (
            <div className="rounded-2xl p-5 border" style={{
              background: 'rgba(249,115,22,0.06)', borderColor: 'rgba(249,115,22,0.2)'
            }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3 text-[#f97316]">
                Missing Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {data.missing_skills.map(s => (
                  <span key={s} className="px-3 py-1 rounded-lg text-xs font-bold text-[#f97316]"
                    style={{ background: 'rgba(249,115,22,0.12)' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {data.recommendations?.length > 0 && (
            <div className="rounded-2xl p-5 border" style={{
              background: 'rgba(60,197,224,0.05)', borderColor: 'rgba(60,197,224,0.2)'
            }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3 text-[#3cc5e0]">
                How to Improve
              </p>
              <ul className="space-y-2">
                {data.recommendations.map((rec, i) => (
                  <li key={i} className={`flex items-start gap-2.5 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="flex-shrink-0 w-4 h-4 rounded-full bg-[#3cc5e0]/20 text-[#3cc5e0] text-[10px] font-black flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-7 py-5 border-t flex-shrink-0
          ${theme === 'dark' ? 'border-white/[0.06]' : 'border-gray-100'}`}>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${scoreColor}, #2195c4)` }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══ MAIN ═══════════════════════════════════ */
export default function OpportunityDetail({ studentId }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [savingToggle, setSavingToggle] = useState(false);
  const [successChance, setSuccessChance] = useState(null);
  const [showChanceModal, setShowChanceModal] = useState(false);
  const [chanceLoading, setChanceLoading] = useState(false);

  useEffect(() => { fetchOpportunity(); }, [id]);

  const fetchOpportunity = async () => {
    setLoading(true);
    try {
      const data = await api.getOpportunities({});
      const opp = data.find(o => o.id === parseInt(id));
      if (opp) {
        setOpportunity(opp);
        if (studentId) {
          const savedData = await api.getSavedOpportunities(studentId);
          setSaved(savedData.some(item => item.opportunity.id === opp.id));
        }
      } else {
        navigate('/opportunities');
      }
    } catch {
      navigate('/opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!studentId || savingToggle) return;
    setSavingToggle(true);
    try {
      if (saved) {
        await api.unsaveOpportunity(opportunity.id, studentId);
        setSaved(false);
      } else {
        await api.saveOpportunity(opportunity.id, studentId);
        setSaved(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingToggle(false);
    }
  };

  const handleCheckChance = async () => {
    if (!studentId) return;
    setChanceLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/opportunities/${opportunity.id}/success-chance/${studentId}`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      setSuccessChance(data);
      setShowChanceModal(true);
    } catch {
      alert('Failed to analyze. Please try again.');
    } finally {
      setChanceLoading(false);
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#060d18]' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(60,197,224,0.1)' }}>
            <div className="w-7 h-7 rounded-full border-2 border-[#3cc5e0] border-t-transparent animate-spin" />
          </div>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Loading…</p>
        </div>
      </div>
    );
  }

  if (!opportunity) return null;

  const daysLeft = getDaysLeft(opportunity.deadline);
  const isUrgent = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0;
  const isExpired = daysLeft !== null && daysLeft < 0;
  const accent = catColor(opportunity.category);
  const effectiveUrl = opportunity.apply_url || opportunity.source_url;

  const deadlineBadgeStyle = isExpired
    ? { background: 'rgba(239,68,68,0.12)', color: '#ef4444' }
    : isUrgent
      ? { background: 'rgba(249,115,22,0.12)', color: '#f97316' }
      : { background: 'rgba(32,192,160,0.12)', color: '#20c0a0' };

  const deadlineLabel = isExpired
    ? 'Expired'
    : daysLeft === 0
      ? 'Due today'
      : daysLeft === 1
        ? '1 day left'
        : daysLeft !== null
          ? `${daysLeft} days left`
          : 'No deadline';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-[#060d18]' : 'bg-gray-50'}`}>

      {/* ═════ HERO ═════════════════════════════ */}
      <div className="relative overflow-hidden" style={{
        background: theme === 'dark'
          ? 'linear-gradient(135deg, #0a1628 0%, #001a35 40%, #0f1f2e 100%)'
          : 'linear-gradient(135deg, #0c1e3a 0%, #0d2847 50%, #0f1f2e 100%)'
      }}>
        {/* Glow */}
        <div className="absolute top-0 right-1/4 w-[450px] h-[350px] rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${accent}, transparent 70%)` }} />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
          {/* Back */}
          <Link to="/opportunities"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mb-8">
            ← Opportunities
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Tags row */}
              <div className="flex flex-wrap gap-2 mb-4">
                {opportunity.category && <Tag label={opportunity.category} color={accent} />}
                {opportunity.direction && <Tag label={opportunity.direction} color="#a855f7" />}
                {opportunity.format && <Tag label={opportunity.format} color="#6366f1" />}
                {opportunity.grade_level && (
                  <Tag label={`Grade ${opportunity.grade_level}`} color="#ffd700" />
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
                {opportunity.title}
              </h1>

              {opportunity.description && (
                <p className="text-slate-400 text-base leading-relaxed max-w-2xl">
                  {opportunity.description.length > 200
                    ? opportunity.description.substring(0, 200) + '…'
                    : opportunity.description}
                </p>
              )}

              {/* Deadline pill */}
              <div className="flex items-center gap-3 mt-5">
                <span className="text-slate-500 text-sm">{formatDeadline(opportunity.deadline)}</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold" style={deadlineBadgeStyle}>
                  {deadlineLabel}
                </span>
                {isUrgent && !isExpired && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-[#f97316]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] animate-pulse" />
                    Urgent
                  </span>
                )}
              </div>
            </div>

            {/* Save / Bookmark button */}
            <button
              onClick={handleSave}
              disabled={savingToggle}
              title={saved ? 'Remove from saved' : 'Save opportunity'}
              className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200
                ${saved
                  ? 'text-rose-400'
                  : 'text-slate-600 hover:text-rose-400'
                } ${savingToggle ? 'opacity-50' : ''}
                bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.1] hover:border-rose-400/30`}
            >
              <svg viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'}
                stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
          style={{
            background: theme === 'dark'
              ? 'linear-gradient(to bottom, transparent, #060d18)'
              : 'linear-gradient(to bottom, transparent, #f9fafb)'
          }} />
      </div>

      {/* ═════ CONTENT ══════════════════════════ */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: main content ──────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Full description */}
            {opportunity.description && (
              <div className={`rounded-2xl p-7 border ${theme === 'dark' ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-white border-gray-100 shadow-sm'}`}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1 h-5 rounded-full" style={{ background: accent }} />
                  <h2 className={`font-bold text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    About this opportunity
                  </h2>
                </div>
                <p className={`text-sm leading-relaxed whitespace-pre-wrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {opportunity.description}
                </p>
              </div>
            )}

            {/* Requirements */}
            {opportunity.requirements && (
              <div className={`rounded-2xl p-7 border ${theme === 'dark' ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-white border-gray-100 shadow-sm'}`}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1 h-5 rounded-full" style={{ background: '#a855f7' }} />
                  <h2 className={`font-bold text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Requirements
                  </h2>
                </div>
                <p className={`text-sm leading-relaxed whitespace-pre-wrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {opportunity.requirements}
                </p>
              </div>
            )}

            {/* Details table */}
            <div className={`rounded-2xl border overflow-hidden ${theme === 'dark' ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-white border-gray-100 shadow-sm'}`}>
              <div className={`px-7 py-4 border-b ${theme === 'dark' ? 'border-white/[0.06] bg-white/[0.02]' : 'border-gray-100 bg-gray-50/50'}`}>
                <p className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  Details
                </p>
              </div>
              <div className="px-7">
                <DetailRow label="Category" value={opportunity.category} theme={theme} accent={accent} />
                <DetailRow label="Direction" value={opportunity.direction} theme={theme} accent="#a855f7" />
                <DetailRow label="Format" value={opportunity.format} theme={theme} accent="#6366f1" />
                <DetailRow label="Grade" value={opportunity.grade_level ? `Grade ${opportunity.grade_level}` : null} theme={theme} accent="#ffd700" />
                <DetailRow label="Deadline" value={formatDeadline(opportunity.deadline)} theme={theme} accent={isUrgent ? '#f97316' : '#20c0a0'} />
              </div>
            </div>
          </div>

          {/* ── Right: CTA sidebar ─────────── */}
          <div className="space-y-4">

            {/* Apply card */}
            <div className={`rounded-2xl border overflow-hidden ${theme === 'dark' ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-white border-gray-100 shadow-sm'}`}>
              {/* Deadline indicator */}
              <div className="px-6 pt-6 pb-4">
                <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  Deadline
                </p>
                <p className={`text-base font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatDeadline(opportunity.deadline)}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold`}
                    style={deadlineBadgeStyle}>
                    {deadlineLabel}
                  </span>
                </div>
              </div>

              <div className={`h-px mx-6 ${theme === 'dark' ? 'bg-white/[0.05]' : 'bg-gray-100'}`} />

              <div className="px-6 py-5 space-y-3">
                {effectiveUrl ? (
                  <a
                    href={effectiveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-bold text-white rounded-xl transition-all duration-200 hover:opacity-90 hover:shadow-lg hover:scale-[1.01]"
                    style={{ background: `linear-gradient(135deg, ${accent}, #2195c4)` }}
                  >
                    {opportunity.apply_url ? 'Apply Now' : 'Open Source'}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                ) : (
                  <div className={`flex items-center justify-center w-full py-3.5 rounded-xl text-sm font-semibold
                    ${theme === 'dark' ? 'bg-white/[0.04] text-gray-500' : 'bg-gray-100 text-gray-400'}`}>
                    Link coming soon
                  </div>
                )}

                {/* Success chance */}
                <button
                  onClick={handleCheckChance}
                  disabled={chanceLoading}
                  className={`w-full py-3.5 rounded-xl text-sm font-bold border transition-all duration-200 flex items-center justify-center gap-2
                    ${chanceLoading
                      ? 'opacity-60 cursor-wait'
                      : 'hover:scale-[1.01]'
                    }
                    ${theme === 'dark'
                      ? 'border-white/[0.1] text-white hover:bg-white/[0.05]'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {chanceLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Analyzing…
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-[#3cc5e0]">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                      </svg>
                      Check My Chances
                    </>
                  )}
                </button>

                {/* Save */}
                <button
                  onClick={handleSave}
                  disabled={savingToggle}
                  className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 border flex items-center justify-center gap-2
                    ${saved
                      ? 'border-rose-400/30 text-rose-400 bg-rose-400/[0.06]'
                      : theme === 'dark'
                        ? 'border-white/[0.08] text-gray-400 hover:border-rose-400/30 hover:text-rose-400'
                        : 'border-gray-200 text-gray-500 hover:border-rose-300 hover:text-rose-500'
                    } ${savingToggle ? 'opacity-50' : ''}`}
                >
                  <svg viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  {saved ? 'Saved' : 'Save for later'}
                </button>

                <p className={`text-center text-xs ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
                  AI analyzes your profile match
                </p>
              </div>
            </div>

            {/* Back link card */}
            <div className={`rounded-2xl border p-5 ${theme === 'dark' ? 'bg-white/[0.02] border-white/[0.05]' : 'bg-white border-gray-100'}`}>
              <Link to="/opportunities"
                className={`flex items-center justify-center gap-2 text-sm font-semibold transition-colors
                  ${theme === 'dark' ? 'text-gray-500 hover:text-[#3cc5e0]' : 'text-gray-400 hover:text-[#2195c4]'}`}>
                ← Browse all opportunities
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showChanceModal && successChance && (
        <ChanceModal data={successChance} onClose={() => setShowChanceModal(false)} theme={theme} />
      )}
    </div>
  );
}
