import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';

const STAGES = [
  { key: 'discovered', label: 'Discovered', icon: '💡' },
  { key: 'exploring', label: 'Exploring', icon: '🔍' },
  { key: 'preparing', label: 'Preparing', icon: '📝' },
  { key: 'ready', label: 'Ready', icon: '✅' },
  { key: 'applied', label: 'Applied', icon: '🚀' },
];

const FACTOR_LABELS = {
  profile_match: 'Profile Match',
  deadline_safety: 'Deadline Safety',
  course_progress: 'Course Progress',
  profile_completeness: 'Preparation',
};

const MISSION_STYLE = {
  urgent:   { border: 'border-red-200',     bg: 'bg-red-50',     badge: 'bg-red-500 text-white',     btn: 'bg-red-600 hover:bg-red-700 text-white' },
  learning: { border: 'border-blue-200',    bg: 'bg-blue-50',    badge: 'bg-blue-600 text-white',    btn: 'bg-blue-600 hover:bg-blue-700 text-white' },
  prepare:  { border: 'border-amber-200',   bg: 'bg-amber-50',   badge: 'bg-amber-500 text-white',   btn: 'bg-amber-600 hover:bg-amber-700 text-white' },
  explore:  { border: 'border-emerald-200', bg: 'bg-emerald-50', badge: 'bg-emerald-600 text-white', btn: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
};

function scoreColor(n) {
  if (n >= 80) return '#22c55e';
  if (n >= 60) return '#6366f1';
  if (n >= 40) return '#f59e0b';
  return '#ef4444';
}

function scoreTier(n) {
  if (n >= 80) return { label: 'Fully Protected', grad: 'from-slate-900 via-emerald-950 to-green-950', glow: 'rgba(34,197,94,0.15)', accent: '#22c55e' };
  if (n >= 60) return { label: 'On Track',        grad: 'from-slate-900 via-blue-950 to-indigo-950',   glow: 'rgba(99,102,241,0.15)', accent: '#6366f1' };
  if (n >= 40) return { label: 'Needs Attention', grad: 'from-slate-900 via-amber-950 to-orange-950',  glow: 'rgba(245,158,11,0.15)', accent: '#f59e0b' };
  return              { label: 'At Risk',          grad: 'from-slate-900 via-red-950 to-rose-950',      glow: 'rgba(239,68,68,0.15)',  accent: '#ef4444' };
}

function daysLabel(days) {
  if (days === null || days === undefined) return 'No deadline';
  if (days < 0) return 'Expired';
  if (days === 0) return 'Due today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}

function ReadinessCard({ item, onStageChange }) {
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
    <div className={`bg-white rounded-2xl border overflow-hidden shadow-sm flex flex-col ${isUrgent ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200'}`}>
      <div className="p-5 flex-1">

        <div className="flex items-start gap-4 mb-4">
          <div className="relative flex-shrink-0 w-14 h-14">
            <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
              <circle cx="24" cy="24" r="20" fill="none" stroke="#f1f5f9" strokeWidth="4" />
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
              <span className="text-xs font-black" style={{ color }}>{item.readiness_score}%</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              {isUrgent && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />}
              <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">{item.title}</h4>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {item.category && <span className="text-xs text-slate-400 capitalize">{item.category}</span>}
              {item.direction && <><span className="text-slate-200">·</span><span className="text-xs text-slate-400">{item.direction}</span></>}
            </div>
          </div>

          <div className="flex-shrink-0">
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
              item.days_left !== null && item.days_left <= 3 && item.days_left >= 0
                ? 'bg-red-100 text-red-700'
                : item.days_left !== null && item.days_left >= 0 && item.days_left <= 7
                ? 'bg-amber-100 text-amber-700'
                : 'bg-slate-100 text-slate-500'
            }`}>
              {daysLabel(item.days_left)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {Object.entries(item.factor_scores || {}).map(([key, val]) => {
            const fc = scoreColor(val);
            return (
              <div key={key} className="bg-slate-50 rounded-xl px-3 py-2">
                <p className="text-xs text-slate-400 mb-1.5">{FACTOR_LABELS[key] || key}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${val}%`, backgroundColor: fc }} />
                  </div>
                  <span className="text-xs font-bold w-7 text-right" style={{ color: fc }}>{val}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {item.next_action && (
          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 mb-4">
            <div className="flex items-start gap-2">
              <span className="text-base flex-shrink-0 mt-0.5">⚡</span>
              <div>
                <p className="text-xs font-bold text-indigo-800 mb-0.5">Best next action</p>
                <p className="text-sm text-indigo-700 leading-snug">{item.next_action}</p>
                {item.next_action_impact > 0 && (
                  <p className="text-xs text-indigo-400 mt-1">Readiness +{item.next_action_impact}%</p>
                )}
              </div>
            </div>
          </div>
        )}

        {item.missing_steps?.length > 0 && (
          <div>
            <button
              onClick={() => setStepsOpen(v => !v)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors mb-2"
            >
              <span className={`transition-transform ${stepsOpen ? 'rotate-90' : ''}`}>▶</span>
              {stepsOpen ? 'Hide' : 'Show'} missing steps ({item.missing_steps.length})
            </button>
            {stepsOpen && (
              <ul className="space-y-1.5">
                {item.missing_steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="flex-shrink-0 w-4 h-4 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs mt-0.5 text-slate-400">✗</span>
                    <span className="leading-snug">{step}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 bg-slate-50 px-5 py-3">
        <p className="text-xs font-semibold text-slate-400 mb-2">Application stage</p>
        <div className="flex flex-wrap gap-1.5">
          {STAGES.map((s) => {
            const active = s.key === item.stage;
            return (
              <button
                key={s.key}
                onClick={() => handleStage(s.key)}
                disabled={saving}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                  active
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                } disabled:opacity-60`}
              >
                <span>{s.icon}</span>{s.label}
              </button>
            );
          })}
        </div>
        {item.suggested_stage !== item.stage && item.suggested_stage !== 'discovered' && (
          <p className="text-xs text-slate-400 mt-1.5">
            Suggested:{' '}
            <button
              onClick={() => handleStage(item.suggested_stage)}
              className="text-indigo-500 font-semibold hover:underline"
            >
              {STAGES.find(s => s.key === item.suggested_stage)?.label}
            </button>
            {' '}based on your readiness
          </p>
        )}
      </div>
    </div>
  );
}

export default function Guardian({ studentId }) {
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

  useEffect(() => { load(); }, [load]);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <span className="text-7xl animate-pulse">🛡️</span>
        <p className="text-slate-500 font-semibold tracking-wide">Calculating your mission...</p>
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
    <div className="min-h-screen bg-slate-50">

      <div className={`bg-gradient-to-br ${tier.grad} text-white`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">

            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-5xl">🛡️</span>
                <div>
                  <p className="text-slate-400 text-sm font-medium tracking-wide uppercase">Guardian Command Center</p>
                  <h1 className="text-3xl font-black text-white">{studentName}'s Mission</h1>
                </div>
              </div>
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
                style={{ background: tier.glow, border: `1px solid ${tier.accent}40`, color: tier.accent }}
              >
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: tier.accent }} />
                {tier.label}
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <div className="relative w-36 h-36">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="7" />
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
                  <span className="text-xs text-slate-400 font-semibold">/ 100</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 font-semibold tracking-wide uppercase">Guardian Score</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-white/10">
            {[
              { icon: '🎯', val: watchlist.length,            label: 'Tracked Opportunities' },
              { icon: '📚', val: courses.length,              label: 'Active Courses' },
              { icon: '⚡', val: data?.incomplete_lessons ?? 0, label: 'Lessons Remaining' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl">{s.icon}</p>
                <p className="text-3xl font-black text-white mt-1 leading-none">{s.val}</p>
                <p className="text-xs text-slate-400 mt-1.5 leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {(emailAvailable || telegramAvailable || tgState === 'connected') && (
          <section>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <button
                onClick={() => setAlertsOpen(v => !v)}
                className="w-full flex items-center justify-between px-6 py-5 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🔔</span>
                  <div>
                    <p className="font-bold text-slate-800">Smart Alerts</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {(emailActive || tgState === 'connected')
                        ? 'Active — you\'ll be notified before deadlines'
                        : 'Set up alerts to never miss a deadline'}
                    </p>
                  </div>
                  {(emailActive || tgState === 'connected') && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active
                    </span>
                  )}
                </div>
                <span className={`text-slate-400 text-sm transition-transform duration-200 ${alertsOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {alertsOpen && (
                <div className="border-t border-slate-100 divide-y divide-slate-100">

                  {emailAvailable && (
                    <div className="px-6 py-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-800">📧 Weekly Mission Report</p>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            Receive your Guardian Score, upcoming deadlines, readiness overview, and next steps every week.
                          </p>
                        </div>
                        <button
                          onClick={() => toggleEmail(!emailActive)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors mt-0.5 ${
                            emailActive ? 'bg-indigo-600' : 'bg-slate-300'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            emailActive ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                      {emailActive && (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={sendEmailReport}
                            disabled={emailSending}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                          >
                            {emailSending ? 'Sending...' : 'Send Report Now'}
                          </button>
                          {emailResult === 'sent' && (
                            <span className="text-xs font-semibold text-green-600">✓ Report sent!</span>
                          )}
                          {emailResult === 'error' && (
                            <span className="text-xs font-semibold text-red-500">Could not send. Try again.</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {telegramAvailable && (
                    <div className="px-6 py-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-800">✈️ Telegram Coach</p>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            {tgState === 'connected'
                              ? 'Your personal coach is active. Send /today, /deadlines, /score, /watchlist, or /courses to your bot.'
                              : 'Connect Telegram for instant deadline alerts and a personal coach bot.'}
                          </p>
                        </div>

                        {tgState === 'connected' ? (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-green-100 text-green-700 flex-shrink-0">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Connected
                          </span>
                        ) : (
                          <button
                            onClick={connectTelegram}
                            disabled={tgState === 'loading'}
                            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                              tgState === 'waiting'
                                ? 'bg-amber-100 text-amber-700 cursor-wait'
                                : tgState === 'loading'
                                ? 'bg-slate-100 text-slate-400 cursor-wait'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                            }`}
                          >
                            {tgState === 'loading' ? 'Opening...' : tgState === 'waiting' ? '⏳ Waiting...' : 'Connect'}
                          </button>
                        )}
                      </div>

                      {tgState === 'waiting' && (
                        <div className="mt-3 p-3.5 rounded-xl bg-blue-50 border border-blue-100">
                          <p className="text-xs font-semibold text-blue-800 mb-1">Open Telegram and tap Start</p>
                          <p className="text-xs text-blue-600">Your account will be linked automatically.</p>
                        </div>
                      )}

                      {tgState === 'connected' && (
                        <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                          <p className="text-xs font-semibold text-slate-600 mb-1.5">Bot commands:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {['/today', '/deadlines', '/watchlist', '/score', '/courses', '/guardian'].map(cmd => (
                              <span key={cmd} className="text-xs px-2 py-0.5 bg-white border border-slate-200 rounded-full text-slate-500 font-mono">{cmd}</span>
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

        {missions.length > 0 && (
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-4">Today's Mission</h2>
            <div className="space-y-3">
              {missions.map((m, i) => {
                const ms = MISSION_STYLE[m.priority] || MISSION_STYLE.explore;
                return (
                  <div key={i} className={`rounded-2xl border-2 p-5 ${ms.border} ${ms.bg}`}>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl flex-shrink-0">{m.icon}</span>
                      <div className="flex-1 min-w-0">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black tracking-wide mb-1 ${ms.badge}`}>
                          {m.badge}
                        </span>
                        <p className="font-bold text-slate-900 truncate text-sm">{m.title}</p>
                        <p className="text-sm text-slate-600 mt-0.5 leading-snug">{m.action}</p>
                      </div>
                      <button
                        onClick={() => navigate(m.link)}
                        className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${ms.btn}`}
                      >
                        Go →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-slate-900">Opportunity Watchlist</h2>
            <Link to="/opportunities" className="text-sm text-indigo-600 font-semibold hover:underline">
              Browse all →
            </Link>
          </div>

          {watchlist.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white px-8 py-10 text-center mb-6">
              <p className="text-5xl mb-3">🎯</p>
              <p className="font-bold text-slate-700 text-lg mb-1">Nothing tracked yet</p>
              <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
                Start tracking opportunities to see your readiness score and next best actions.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 mb-6">
              {watchlist.map(item => (
                <ReadinessCard key={item.opportunity_id} item={item} onStageChange={handleStageChange} />
              ))}
            </div>
          )}

          {recs.length > 0 && watchlist.length < 4 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  Recommended to Track
                </span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {recs.slice(0, 3).map(r => {
                  const isTracking = tracking.has(r.id);
                  const d = r.days_left;
                  const dLabel = d === null ? 'No deadline' : d === 0 ? 'Due today' : d === 1 ? '1 day left' : `${d} days left`;
                  const dColor = d !== null && d <= 3 ? 'bg-red-100 text-red-700' : d !== null && d <= 14 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500';
                  return (
                    <div key={r.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col gap-3 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {r.category && (
                            <span className="text-xs text-slate-400 capitalize">{r.category}</span>
                          )}
                          <h4 className="font-bold text-slate-900 text-sm leading-snug mt-0.5 line-clamp-2">{r.title}</h4>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${dColor}`}>
                          {dLabel}
                        </span>
                      </div>
                      <p className="text-xs text-indigo-600 font-semibold leading-snug">{r.match_reason}</p>
                      <button
                        onClick={() => handleTrack(r.id)}
                        disabled={isTracking}
                        className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${
                          isTracking
                            ? 'bg-slate-100 text-slate-400 cursor-wait'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                        }`}
                      >
                        {isTracking ? 'Adding...' : '+ Track this'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {courses.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-slate-900">Learning Momentum</h2>
              <Link to="/courses" className="text-sm text-indigo-600 font-semibold hover:underline">
                All courses →
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {courses.map(c => {
                const done = c.progress >= 100;
                const icon = done ? '🏆' : c.progress > 50 ? '🔥' : c.progress > 0 ? '📖' : '🚀';
                const color = done ? '#22c55e' : c.progress > 50 ? '#f59e0b' : '#6366f1';
                return (
                  <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-start gap-2 mb-3">
                      <span className="text-2xl flex-shrink-0">{icon}</span>
                      <p className="font-bold text-slate-900 text-sm leading-snug">{c.title}</p>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.max(c.progress, c.progress > 0 ? 3 : 0)}%`, backgroundColor: color }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        {c.progress === 0 ? 'Not started' : done ? 'Completed 🎉' : `${c.progress.toFixed(0)}% done`}
                      </span>
                      <span className="text-sm font-black" style={{ color }}>{c.progress.toFixed(0)}%</span>
                    </div>
                    {!done && (
                      <button
                        onClick={() => navigate('/courses')}
                        className="mt-3 text-xs text-indigo-600 font-semibold hover:underline"
                      >
                        {c.progress > 0 ? 'Continue →' : 'Start →'}
                      </button>
                    )}
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
