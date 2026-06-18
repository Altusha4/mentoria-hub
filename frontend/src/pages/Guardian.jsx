import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useTheme } from '../context/ThemeContext';

/* ═══ SVG Icons ═══ */
const ShieldIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const TargetIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
);

const BookIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const ZapIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const BellIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const ChevronDownIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ArrowRightIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

const RefreshIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ExternalLinkIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

/* ═══ Stage icons as SVG ═══ */
const LightbulbIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" /><path d="M10 22h4" />
  </svg>
);

const SearchIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const EditIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const RocketIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
  </svg>
);

const STAGE_ICONS = {
  discovered: LightbulbIcon,
  exploring: SearchIcon,
  preparing: EditIcon,
  ready: CheckIcon,
  applied: RocketIcon,
};

/* ═══ Constants ═══ */
const STAGES = [
  { key: 'discovered', label: 'Discovered' },
  { key: 'exploring', label: 'Exploring' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'applied', label: 'Applied' },
];

const FACTOR_LABELS = {
  profile_match: 'Profile Match',
  deadline_safety: 'Deadline Safety',
  course_progress: 'Course Progress',
  profile_completeness: 'Preparation',
};

/* ── Score helpers ─────────────────────────────── */
function scoreColor(n) {
  if (n >= 80) return '#22c55e';
  if (n >= 60) return '#6366f1';
  if (n >= 40) return '#f59e0b';
  return '#ef4444';
}

function scoreTier(n) {
  if (n >= 80) return {
    label: 'Fully Protected',
    headerBg: 'linear-gradient(135deg, #0a2818 0%, #052010 40%, #0f2f1e 100%)',
    glow: 'rgba(34,197,94,0.18)', accent: '#22c55e', accentDim: 'rgba(34,197,94,0.12)'
  };
  if (n >= 60) return {
    label: 'On Track',
    headerBg: 'linear-gradient(135deg, #0a1628 0%, #001a35 40%, #0f1f2e 100%)',
    glow: 'rgba(99,102,241,0.18)', accent: '#6366f1', accentDim: 'rgba(99,102,241,0.12)'
  };
  if (n >= 40) return {
    label: 'Needs Attention',
    headerBg: 'linear-gradient(135deg, #1a1000 0%, #2a1800 40%, #1f1500 100%)',
    glow: 'rgba(245,158,11,0.18)', accent: '#f59e0b', accentDim: 'rgba(245,158,11,0.12)'
  };
  return {
    label: 'At Risk',
    headerBg: 'linear-gradient(135deg, #1a0800 0%, #2a0f00 40%, #1f0a00 100%)',
    glow: 'rgba(239,68,68,0.18)', accent: '#ef4444', accentDim: 'rgba(239,68,68,0.12)'
  };
}

const MISSION_STYLE = {
  urgent:   { borderColor: '#fca5a5', bgDark: 'rgba(239,68,68,0.06)',   bgLight: '#fff5f5', badgeGrad: 'linear-gradient(135deg,#ef4444,#dc2626)', btn: 'bg-red-600 hover:bg-red-700 text-white' },
  learning: { borderColor: '#93c5fd', bgDark: 'rgba(59,130,246,0.06)',  bgLight: '#eff6ff', badgeGrad: 'linear-gradient(135deg,#3b82f6,#2563eb)', btn: 'bg-blue-600 hover:bg-blue-700 text-white' },
  prepare:  { borderColor: '#fcd34d', bgDark: 'rgba(245,158,11,0.06)',  bgLight: '#fffbeb', badgeGrad: 'linear-gradient(135deg,#f59e0b,#d97706)', btn: 'bg-amber-600 hover:bg-amber-700 text-white' },
  explore:  { borderColor: '#6ee7b7', bgDark: 'rgba(16,185,129,0.06)', bgLight: '#f0fdf4', badgeGrad: 'linear-gradient(135deg,#10b981,#059669)', btn: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
};

function daysLabel(days) {
  if (days === null || days === undefined) return 'No deadline';
  if (days < 0) return 'Expired';
  if (days === 0) return 'Due today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}

/* ═══ ReadinessCard ═══ */
function ReadinessCard({ item, onStageChange, theme }) {
  const [stepsOpen, setStepsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const color = scoreColor(item.readiness_score);
  const isUrgent = item.days_left !== null && item.days_left !== undefined && item.days_left <= 3 && item.days_left >= 0;
  const circumference = 2 * Math.PI * 20;

  const handleStage = async (stage) => {
    if (saving || stage === item.stage) return;
    setSaving(true);
    try { await onStageChange(item.opportunity_id, stage); } finally { setSaving(false); }
  };

  return (
    <div className={`rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-0.5
      ${theme === 'dark'
        ? `bg-white/[0.04] border ${isUrgent ? 'border-red-500/30' : 'border-white/[0.08]'} hover:bg-white/[0.07] hover:border-white/[0.14]`
        : `bg-white border shadow-sm ${isUrgent ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-200'} hover:shadow-md`
      }`}
    >
      <div className="p-5 flex-1">
        {/* Header Row */}
        <div className="flex items-start gap-3 mb-4">
          {/* Radial score */}
          <div className="relative flex-shrink-0 w-14 h-14">
            <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
              <circle cx="24" cy="24" r="20" fill="none" stroke={theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#f1f5f9'} strokeWidth="4" />
              <circle
                cx="24" cy="24" r="20" fill="none"
                stroke={color} strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - item.readiness_score / 100)}
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-black" style={{ color }}>{item.readiness_score}%</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              {isUrgent && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />}
              <h4 className={`font-bold text-sm leading-snug line-clamp-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {item.title}
              </h4>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {item.category && <span className={`text-xs capitalize ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{item.category}</span>}
              {item.direction && <>
                <span className={theme === 'dark' ? 'text-gray-700' : 'text-gray-200'}>·</span>
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{item.direction}</span>
              </>}
            </div>
          </div>

          {/* Deadline badge */}
          <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
            item.days_left !== null && item.days_left <= 3 && item.days_left >= 0
              ? 'bg-red-100 text-red-700'
              : item.days_left !== null && item.days_left >= 0 && item.days_left <= 7
                ? 'bg-amber-100 text-amber-700'
                : theme === 'dark' ? 'bg-white/[0.06] text-gray-400' : 'bg-gray-100 text-gray-500'
          }`}>
            {daysLabel(item.days_left)}
          </span>
        </div>

        {/* Factor Scores */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {Object.entries(item.factor_scores || {}).map(([key, val]) => {
            const fc = scoreColor(val);
            return (
              <div key={key} className={`rounded-xl px-3 py-2.5 ${theme === 'dark' ? 'bg-white/[0.04]' : 'bg-gray-50'}`}>
                <p className={`text-[11px] mb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  {FACTOR_LABELS[key] || key}
                </p>
                <div className="flex items-center gap-2">
                  <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-gray-200'}`}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${val}%`, backgroundColor: fc }} />
                  </div>
                  <span className="text-xs font-bold w-7 text-right" style={{ color: fc }}>{val}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Next Action */}
        {item.next_action && (
          <div className={`p-3 rounded-xl mb-4 border ${
            theme === 'dark'
              ? 'bg-[#3cc5e0]/[0.06] border-[#3cc5e0]/20'
              : 'bg-indigo-50 border-indigo-100'
          }`}>
            <div className="flex items-start gap-2">
              <ZapIcon className="w-4 h-4 text-[#3cc5e0] flex-shrink-0 mt-0.5" />
              <div>
                <p className={`text-xs font-bold mb-0.5 ${theme === 'dark' ? 'text-[#3cc5e0]' : 'text-indigo-800'}`}>
                  Best next action
                </p>
                <p className={`text-sm leading-snug ${theme === 'dark' ? 'text-gray-300' : 'text-indigo-700'}`}>
                  {item.next_action}
                </p>
                {item.next_action_impact > 0 && (
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-indigo-400'}`}>
                    Readiness +{item.next_action_impact}%
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Missing Steps */}
        {item.missing_steps?.length > 0 && (
          <div>
            <button
              onClick={() => setStepsOpen(v => !v)}
              className={`flex items-center gap-1.5 text-xs font-semibold transition-colors mb-2
                ${theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${stepsOpen ? 'rotate-180' : ''}`} />
              {stepsOpen ? 'Hide' : 'Show'} missing steps ({item.missing_steps.length})
            </button>
            {stepsOpen && (
              <ul className="space-y-1.5">
                {item.missing_steps.map((step, i) => (
                  <li key={i} className={`flex items-start gap-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span className={`flex-shrink-0 w-4 h-4 rounded-full border flex items-center justify-center mt-0.5
                      ${theme === 'dark' ? 'border-white/[0.1] bg-white/[0.04]' : 'border-gray-200 bg-gray-50'}`}>
                      <XIcon className="w-2.5 h-2.5 text-gray-400" />
                    </span>
                    <span className="leading-snug">{step}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Footer — Stage Tracker */}
      <div className={`border-t px-5 py-4 ${theme === 'dark' ? 'border-white/[0.06] bg-white/[0.02]' : 'border-gray-100 bg-gray-50'}`}>
        <p className={`text-[11px] font-semibold uppercase tracking-wider mb-2.5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
          Application stage
        </p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {STAGES.map((s) => {
            const active = s.key === item.stage;
            const StageIcon = STAGE_ICONS[s.key] || CheckIcon;
            return (
              <button
                key={s.key}
                onClick={() => handleStage(s.key)}
                disabled={saving}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all
                  ${active
                    ? 'text-white shadow-sm'
                    : theme === 'dark'
                      ? 'bg-white/[0.04] text-gray-400 border border-white/[0.08] hover:bg-white/[0.08] hover:text-white'
                      : 'bg-white text-gray-500 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                  } disabled:opacity-60`}
                style={active ? { background: 'linear-gradient(135deg, #3cc5e0, #2195c4)' } : {}}
              >
                <StageIcon className="w-3 h-3" />
                {s.label}
              </button>
            );
          })}
        </div>

        {item.suggested_stage !== item.stage && item.suggested_stage !== 'discovered' && (
          <p className={`text-xs mb-3 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            Suggested:{' '}
            <button onClick={() => handleStage(item.suggested_stage)} className="text-[#3cc5e0] font-semibold hover:underline">
              {STAGES.find(s => s.key === item.suggested_stage)?.label}
            </button>
            {' '}based on your readiness
          </p>
        )}

        {item.effective_url ? (
          <a
            href={item.effective_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-xs font-bold transition-all text-white hover:opacity-90 hover:shadow-md"
            style={{ background: 'linear-gradient(135deg, #3cc5e0, #2195c4)' }}
          >
            {item.apply_url ? 'Apply Now' : 'Open Source'}
            <ExternalLinkIcon className="w-3.5 h-3.5" />
          </a>
        ) : (
          <div className={`w-full py-2.5 rounded-xl text-xs font-semibold text-center
            ${theme === 'dark' ? 'bg-white/[0.04] text-gray-500' : 'bg-gray-100 text-gray-400'}`}>
            Application link coming soon
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══ Main Guardian Component ═══ */
export default function Guardian({ studentId }) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [prefs, setPrefs] = useState(null);
  const [recs, setRecs] = useState([]);
  const [tracking, setTracking] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [tgState, setTgState] = useState('idle');
  const [emailSending, setEmailSending] = useState(false);
  const [emailResult, setEmailResult] = useState(null);
  const pollRef = useRef(null);

  const studentName = (sessionStorage.getItem('studentName') || '').split(' ')[0] || 'Student';

  const load = useCallback(async () => {
    try {
      const [mission, p, recommendations] = await Promise.all([
        api.getGuardianMission(studentId),
        api.getNotificationPreferences(studentId),
        api.getGuardianRecommendations(studentId).catch(() => []),
      ]);
      setData(mission);
      setPrefs(p);
      setRecs(recommendations);
      if (p.telegram_chat_id) {
        setTgState('connected');
        api.pollBotCommands().catch(() => {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => { 
    load(); 
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      load();
    }, 30000);
    return () => clearInterval(interval);
  }, [load]);
  
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const handleStageChange = async (opportunityId, stage) => {
    await api.updateOpportunityStage(studentId, opportunityId, stage);
    setData(prev => ({
      ...prev,
      watchlist: prev.watchlist.map(item =>
        item.opportunity_id === opportunityId ? { ...item, stage } : item
      ),
    }));
  };

  const handleTrack = async (opportunityId) => {
    if (tracking.has(opportunityId)) return;
    setTracking(prev => new Set([...prev, opportunityId]));
    try {
      const watchlistItem = await api.trackOpportunity(studentId, opportunityId);
      setData(prev => {
        const alreadyIn = prev.watchlist.some(w => w.opportunity_id === opportunityId);
        if (alreadyIn) return prev;
        const newWatchlist = [...prev.watchlist, watchlistItem].sort(
          (a, b) => (a.days_left ?? 9999) - (b.days_left ?? 9999)
        );
        return { ...prev, watchlist: newWatchlist };
      });
      setRecs(prev => prev.filter(r => r.id !== opportunityId));
    } catch (e) {
      console.error(e);
    } finally {
      setTracking(prev => { const s = new Set(prev); s.delete(opportunityId); return s; });
    }
  };

  const toggleEmail = async (val) => {
    try {
      const updated = await api.updateNotificationPreferences(studentId, { email_enabled: val });
      setPrefs(updated);
    } catch {}
  };

  const sendEmailReport = async () => {
    if (emailSending) return;
    setEmailSending(true);
    setEmailResult(null);
    try {
      const res = await api.sendGuardianEmailReport(studentId);
      setEmailResult(res.success ? 'sent' : 'error');
    } catch {
      setEmailResult('error');
    } finally {
      setEmailSending(false);
      setTimeout(() => setEmailResult(null), 4000);
    }
  };

  const connectTelegram = async () => {
    if (['connected', 'loading', 'waiting'].includes(tgState)) return;
    setTgState('loading');
    try {
      const res = await api.getTelegramLink(studentId);
      if (res.connected) { setTgState('connected'); return; }
      if (!res.configured) { setTgState('unavailable'); return; }
      if (res.link) window.open(res.link, '_blank');
      setTgState('waiting');
      let attempts = 0;
      pollRef.current = setInterval(async () => {
        attempts++;
        if (attempts > 40) { clearInterval(pollRef.current); setTgState('idle'); return; }
        try {
          const poll = await api.pollTelegramConnection(studentId);
          if (poll.connected) {
            clearInterval(pollRef.current);
            setTgState('connected');
            setPrefs(p => ({ ...p, telegram_chat_id: 'connected', telegram_enabled: true }));
          }
        } catch {}
      }, 3000);
    } catch { setTgState('idle'); }
  };

  /* ── Loading ─────────────────────────────── */
  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-6 transition-colors ${theme === 'dark' ? 'bg-[#060d18]' : 'bg-gray-50'}`}>
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center animate-pulse"
            style={{ background: 'linear-gradient(135deg, rgba(60,197,224,0.2), rgba(32,192,160,0.2))' }}>
            <ShieldIcon className="w-10 h-10 text-[#3cc5e0]" />
          </div>
          <div className="absolute -inset-2 rounded-3xl border border-[#3cc5e0]/20 animate-ping opacity-30" />
        </div>
        <p className={`font-semibold tracking-wide ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          Calculating your mission...
        </p>
      </div>
    );
  }

  const score = data?.guardian_score ?? 50;
  const tier = scoreTier(score);
  const missions = data?.missions || [];
  const watchlist = data?.watchlist || [];
  const courses = data?.course_progress || [];
  const circumference = 2 * Math.PI * 42;

  const emailAvailable = data?.alert_status?.email_available;
  const emailActive = prefs?.email_enabled;
  const telegramAvailable = data?.alert_status?.telegram_available;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-[#060d18]' : 'bg-gray-50'}`}>

      {/* ════════ HERO HEADER ════════ */}
      <div className="relative overflow-hidden" style={{ background: tier.headerBg }}>
        {/* Glow orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ background: `radial-gradient(circle, ${tier.accent}, transparent 70%)` }} />
        <div className="absolute -bottom-20 left-1/4 w-[400px] h-[400px] rounded-full blur-3xl pointer-events-none opacity-10"
          style={{ background: 'radial-gradient(circle, #818cf8, transparent 70%)' }} />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }} />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">

            {/* Left */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: tier.accentDim, border: `1px solid ${tier.accent}30` }}>
                  <ShieldIcon className="w-6 h-6" style={{ color: tier.accent }} />
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-semibold tracking-widest uppercase">Guardian Command Center</p>
                  <h1 className="text-2xl font-black text-white">{studentName}'s Mission</h1>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ background: tier.accentDim, border: `1px solid ${tier.accent}30` }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: tier.accent }} />
                <span className="text-sm font-bold" style={{ color: tier.accent }}>{tier.label}</span>
              </div>
            </div>

            {/* Right — Score Ring */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <div className="relative w-36 h-36">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke={tier.accent} strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - score / 100)}
                    style={{ transition: 'stroke-dashoffset 1.2s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black" style={{ color: tier.accent }}>{score}</span>
                  <span className="text-xs text-slate-500 font-semibold">/ 100</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 font-semibold tracking-widest uppercase">Guardian Score</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-white/[0.06]">
            {[
              { icon: TargetIcon, val: watchlist.length, label: 'Tracked Opportunities' },
              { icon: BookIcon, val: courses.length, label: 'Active Courses' },
              { icon: ZapIcon, val: data?.incomplete_lessons ?? 0, label: 'Lessons Remaining' },
            ].map(({ icon: Icon, val, label }) => (
              <div key={label} className="text-center">
                <Icon className="w-5 h-5 mx-auto mb-2 text-slate-400" />
                <p className="text-3xl font-black text-white leading-none">{val}</p>
                <p className="text-xs text-slate-400 mt-1.5 leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════ CONTENT ════════ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Smart Alerts Panel ─────────────────────── */}
        {(emailAvailable || telegramAvailable || tgState === 'connected') && (
          <section>
            <div className={`rounded-2xl overflow-hidden transition-colors border
              ${theme === 'dark' ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-white border-gray-200 shadow-sm'}`}>
              <button
                onClick={() => setAlertsOpen(v => !v)}
                className={`w-full flex items-center justify-between px-6 py-5 text-left transition-colors
                  ${theme === 'dark' ? 'hover:bg-white/[0.03]' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                    ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-gray-100'}`}>
                    <BellIcon className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Smart Alerts</p>
                    <p className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      {(emailActive || tgState === 'connected')
                        ? "Active — you'll be notified before deadlines"
                        : 'Set up alerts to never miss a deadline'}
                    </p>
                  </div>
                  {(emailActive || tgState === 'connected') && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  )}
                </div>
                <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200
                  ${alertsOpen ? 'rotate-180' : ''}
                  ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}
                />
              </button>

              {alertsOpen && (
                <div className={`border-t divide-y ${theme === 'dark' ? 'border-white/[0.06] divide-white/[0.04]' : 'border-gray-100 divide-gray-100'}`}>
                  {/* Email */}
                  {emailAvailable && (
                    <div className="px-6 py-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Weekly Mission Report
                          </p>
                          <p className={`text-xs mt-1 leading-relaxed ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            Receive your Guardian Score, upcoming deadlines, readiness overview, and next steps every week.
                          </p>
                        </div>
                        {/* Toggle */}
                        <button
                          onClick={() => toggleEmail(!emailActive)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors mt-0.5 ${emailActive ? 'bg-[#3cc5e0]' : theme === 'dark' ? 'bg-white/[0.1]' : 'bg-gray-200'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${emailActive ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                      {emailActive && (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={sendEmailReport}
                            disabled={emailSending}
                            className="px-4 py-2 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #3cc5e0, #2195c4)' }}
                          >
                            {emailSending ? 'Sending...' : 'Send Report Now'}
                          </button>
                          {emailResult === 'sent' && (
                            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500">
                              <CheckIcon className="w-3.5 h-3.5" /> Report sent!
                            </span>
                          )}
                          {emailResult === 'error' && (
                            <span className="text-xs font-semibold text-red-400">Could not send. Try again.</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Telegram */}
                  {telegramAvailable && (
                    <div className="px-6 py-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Telegram Coach
                          </p>
                          <p className={`text-xs mt-1 leading-relaxed ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            {tgState === 'connected'
                              ? 'Your personal coach is active. Send /today, /deadlines, /score, /watchlist, or /courses to your bot.'
                              : 'Connect Telegram for instant deadline alerts and a personal coach bot.'}
                          </p>
                        </div>
                        {tgState === 'connected' ? (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-700 flex-shrink-0">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Connected
                          </span>
                        ) : (
                          <button
                            onClick={connectTelegram}
                            disabled={tgState === 'loading'}
                            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                              tgState === 'waiting' ? 'bg-amber-100 text-amber-700 cursor-wait'
                                : tgState === 'loading' ? (theme === 'dark' ? 'bg-white/[0.06] text-gray-400' : 'bg-gray-100 text-gray-400') + ' cursor-wait'
                                : 'text-white hover:opacity-90'
                            }`}
                            style={!['waiting', 'loading'].includes(tgState) ? { background: 'linear-gradient(135deg, #3cc5e0, #2195c4)' } : {}}
                          >
                            {tgState === 'loading' ? 'Opening...' : tgState === 'waiting' ? 'Waiting...' : 'Connect'}
                          </button>
                        )}
                      </div>
                      {tgState === 'waiting' && (
                        <div className={`mt-3 p-3.5 rounded-xl ${theme === 'dark' ? 'bg-[#3cc5e0]/[0.06] border border-[#3cc5e0]/20' : 'bg-blue-50 border border-blue-100'}`}>
                          <p className={`text-xs font-semibold mb-1 ${theme === 'dark' ? 'text-[#3cc5e0]' : 'text-blue-800'}`}>
                            Open Telegram and tap Start
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-blue-600'}`}>
                            Your account will be linked automatically.
                          </p>
                        </div>
                      )}
                      {tgState === 'connected' && (
                        <div className={`mt-3 p-3.5 rounded-xl ${theme === 'dark' ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-gray-50 border border-gray-100'}`}>
                          <p className={`text-xs font-semibold mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Bot commands:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {['/today', '/deadlines', '/watchlist', '/score', '/courses', '/guardian'].map(cmd => (
                              <span key={cmd} className={`text-xs px-2 py-0.5 rounded-full font-mono ${theme === 'dark' ? 'bg-white/[0.06] border border-white/[0.08] text-gray-400' : 'bg-white border border-gray-200 text-gray-500'}`}>
                                {cmd}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Today's Missions ─────────────────────── */}
        {missions.length > 0 && (
          <section>
            <h2 className={`text-xl font-black mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Today's Mission
            </h2>
            <div className="space-y-3">
              {missions.map((m, i) => {
                const ms = MISSION_STYLE[m.priority] || MISSION_STYLE.explore;
                return (
                  <div key={i} className="rounded-2xl border-2 p-5 transition-all duration-300"
                    style={{
                      borderColor: ms.borderColor,
                      background: theme === 'dark' ? ms.bgDark : ms.bgLight,
                    }}>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl flex-shrink-0">{m.icon}</span>
                      <div className="flex-1 min-w-0">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-black tracking-wide mb-1 text-white"
                          style={{ background: ms.badgeGrad }}>
                          {m.badge}
                        </span>
                        <p className={`font-bold text-sm truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{m.title}</p>
                        <p className={`text-sm mt-0.5 leading-snug ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{m.action}</p>
                      </div>
                      <button
                        onClick={() => navigate(m.link)}
                        className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${ms.btn}`}
                      >
                        Go <ArrowRightIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Watchlist ────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Opportunity Watchlist
            </h2>
            <Link to="/opportunities" className="flex items-center gap-1 text-sm text-[#3cc5e0] font-semibold hover:text-[#20c0a0] transition-colors">
              Browse all <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>

          {watchlist.length === 0 ? (
            <div className={`rounded-2xl border-2 border-dashed px-8 py-12 text-center mb-6
              ${theme === 'dark' ? 'border-white/[0.08] bg-white/[0.02]' : 'border-gray-200 bg-white'}`}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(60,197,224,0.08), rgba(32,192,160,0.08))' }}>
                <TargetIcon className="w-8 h-8 text-[#3cc5e0] opacity-60" />
              </div>
              <p className={`font-bold text-lg mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Nothing tracked yet</p>
              <p className={`text-sm max-w-sm mx-auto leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Start tracking opportunities to see your readiness score and next best actions.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 mb-6">
              {watchlist.map(item => (
                <ReadinessCard key={item.opportunity_id} item={item} onStageChange={handleStageChange} theme={theme} />
              ))}
            </div>
          )}

          {/* Recommendations */}
          {recs.length > 0 && watchlist.length < 4 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex-1 h-px ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-gray-200'}`} />
                <span className={`text-xs font-bold uppercase tracking-wider whitespace-nowrap ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  Recommended to Track
                </span>
                <div className={`flex-1 h-px ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-gray-200'}`} />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {recs.slice(0, 3).map(r => {
                  const isTracking = tracking.has(r.id);
                  const d = r.days_left;
                  const dLabel = d === null ? 'No deadline' : d === 0 ? 'Due today' : d === 1 ? '1 day left' : `${d} days left`;
                  const dColor = d !== null && d <= 3
                    ? 'bg-red-100 text-red-700'
                    : d !== null && d <= 14
                      ? 'bg-amber-100 text-amber-700'
                      : theme === 'dark' ? 'bg-white/[0.06] text-gray-400' : 'bg-gray-100 text-gray-500';

                  return (
                    <div key={r.id} className={`rounded-2xl border p-4 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-0.5
                      ${theme === 'dark'
                        ? 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12]'
                        : 'bg-white border-gray-200 shadow-sm hover:border-[#3cc5e0]/40 hover:shadow-md'
                      }`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {r.category && <span className={`text-xs capitalize ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{r.category}</span>}
                          <h4 className={`font-bold text-sm leading-snug mt-0.5 line-clamp-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {r.title}
                          </h4>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${dColor}`}>
                          {dLabel}
                        </span>
                      </div>
                      <p className="text-xs text-[#3cc5e0] font-semibold leading-snug">{r.match_reason}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleTrack(r.id)}
                          disabled={isTracking}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all
                            ${isTracking
                              ? theme === 'dark' ? 'bg-white/[0.04] text-gray-500 cursor-wait' : 'bg-gray-100 text-gray-400 cursor-wait'
                              : 'text-white hover:opacity-90 hover:shadow-md'
                            }`}
                          style={!isTracking ? { background: 'linear-gradient(135deg, #3cc5e0, #2195c4)' } : {}}
                        >
                          {isTracking ? 'Adding...' : '+ Track'}
                        </button>
                        {r.source_url && (
                          <a
                            href={r.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex-shrink-0 py-2.5 px-3 rounded-xl text-sm font-bold border transition-all
                              ${theme === 'dark'
                                ? 'border-white/[0.08] text-gray-400 hover:border-[#3cc5e0]/40 hover:text-[#3cc5e0]'
                                : 'border-gray-200 text-gray-500 hover:border-[#3cc5e0]/50 hover:text-[#3cc5e0]'
                              }`}
                          >
                            <ExternalLinkIcon className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* ── Learning Momentum ────────────────────── */}
        {courses.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Learning Momentum
              </h2>
              <Link to="/courses" className="flex items-center gap-1 text-sm text-[#3cc5e0] font-semibold hover:text-[#20c0a0] transition-colors">
                All courses <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {courses.map(c => {
                const done = c.progress >= 100;
                const colorVal = done ? '#22c55e' : c.progress > 50 ? '#f59e0b' : '#3cc5e0';
                const barGrad = done
                  ? '#22c55e'
                  : c.progress > 50
                    ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                    : 'linear-gradient(90deg, #3cc5e0, #2195c4)';

                return (
                  <div key={c.id} className={`rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 border
                    ${theme === 'dark'
                      ? 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]'
                      : 'bg-white border-gray-100 shadow-sm hover:shadow-md'
                    }`}>
                    {/* Progress ring mini */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative w-12 h-12 flex-shrink-0">
                        <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
                          <circle cx="24" cy="24" r="20" fill="none" stroke={theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#f1f5f9'} strokeWidth="4" />
                          <circle
                            cx="24" cy="24" r="20" fill="none"
                            strokeWidth="4" strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 20}
                            strokeDashoffset={2 * Math.PI * 20 * (1 - Math.min(c.progress, 100) / 100)}
                            style={{ stroke: colorVal, transition: 'stroke-dashoffset 0.8s ease' }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[9px] font-black" style={{ color: colorVal }}>
                            {c.progress.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <p className={`font-bold text-sm leading-snug ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {c.title}
                      </p>
                    </div>

                    <div className={`h-1.5 rounded-full overflow-hidden mb-3 ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-gray-100'}`}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${c.progress > 0 ? Math.max(c.progress, 3) : 0}%`, background: barGrad }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        {c.progress === 0 ? 'Not started' : done ? 'Completed 🎉' : `${c.progress.toFixed(0)}% done`}
                      </span>
                      {!done && (
                        <button
                          onClick={() => navigate('/courses')}
                          className="text-xs text-[#3cc5e0] font-semibold hover:text-[#20c0a0] transition-colors"
                        >
                          {c.progress > 0 ? 'Continue →' : 'Start →'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
