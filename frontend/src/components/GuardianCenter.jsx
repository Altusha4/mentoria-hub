import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

function buildActions(digest) {
  if (!digest) return [];
  const out = [];
  const deadlines = digest.upcoming_deadlines || [];
  const courses   = digest.course_progress   || [];

  const urgent = deadlines.find(d => d.days_left <= 3);
  if (urgent) {
    const isToday    = urgent.days_left === 0;
    const isTomorrow = urgent.days_left === 1;
    out.push({
      icon:    isToday || isTomorrow ? '🚨' : '⚡',
      badge:   isToday ? 'DUE TODAY' : isTomorrow ? 'DUE TOMORROW' : `${urgent.days_left} DAYS LEFT`,
      color:   isToday || isTomorrow ? 'red' : 'amber',
      title:   urgent.title,
      desc:    `Review requirements and submit your ${urgent.category} application before the deadline.`,
      cta:     isToday || isTomorrow ? 'Apply Now' : 'Review & Apply',
      link:    '/opportunities',
    });
  }

  const active = courses.find(c => c.progress > 0 && c.progress < 100);
  if (active) {
    out.push({
      icon:  '📖',
      badge: `${active.progress.toFixed(0)}% COMPLETE`,
      color: 'blue',
      title: active.title,
      desc:  'You\'re making great progress — keep the momentum going!',
      cta:   'Continue Learning',
      link:  '/courses',
    });
  }

  const fresh = courses.find(c => c.progress === 0);
  if (fresh && out.length < 3) {
    out.push({
      icon:  '🚀',
      badge: 'NOT STARTED',
      color: 'purple',
      title: fresh.title,
      desc:  'Start this course to build skills that will strengthen your applications.',
      cta:   'Start Course',
      link:  '/courses',
    });
  }

  const upcoming = deadlines.find(d => d.days_left > 3 && d.days_left <= 30);
  if (upcoming && out.length < 3) {
    out.push({
      icon:  '🎯',
      badge: `${upcoming.days_left} DAYS`,
      color: 'green',
      title: upcoming.title,
      desc:  'Start preparing early — strong applications take time.',
      cta:   'View Opportunity',
      link:  '/opportunities',
    });
  }

  return out.slice(0, 3);
}

const COLOR = {
  red:    { border: 'border-red-200 dark:border-red-800/60',    bg: 'bg-red-50 dark:bg-red-950/25',      badge: 'bg-red-500 text-white',                    btn: 'bg-red-600 hover:bg-red-700 text-white' },
  amber:  { border: 'border-amber-200 dark:border-amber-800/60', bg: 'bg-amber-50 dark:bg-amber-950/25',  badge: 'bg-amber-500 text-white',                  btn: 'bg-amber-600 hover:bg-amber-700 text-white' },
  blue:   { border: 'border-blue-200 dark:border-blue-800/60',   bg: 'bg-blue-50 dark:bg-blue-950/25',    badge: 'bg-blue-600 text-white',                   btn: 'bg-blue-600 hover:bg-blue-700 text-white' },
  purple: { border: 'border-purple-200 dark:border-purple-800/60', bg: 'bg-purple-50 dark:bg-purple-950/25', badge: 'bg-purple-600 text-white',               btn: 'bg-purple-600 hover:bg-purple-700 text-white' },
  green:  { border: 'border-emerald-200 dark:border-emerald-800/60', bg: 'bg-emerald-50 dark:bg-emerald-950/25', badge: 'bg-emerald-600 text-white',          btn: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
};

const RISK_CFG = {
  safe: {
    emoji: '🟢', label: 'On Track',
    sub: 'No urgent deadlines — focus on learning',
    grad: 'from-slate-900 via-blue-950 to-indigo-950',
    accent: '#6366f1', glow: 'rgba(99,102,241,0.18)',
  },
  attention: {
    emoji: '🟡', label: 'Needs Attention',
    sub: 'Deadlines coming up this week',
    grad: 'from-slate-900 via-amber-950 to-orange-950',
    accent: '#f59e0b', glow: 'rgba(245,158,11,0.18)',
  },
  risk: {
    emoji: '🔴', label: 'Deadline Risk',
    sub: 'Urgent — act now before it\'s too late',
    grad: 'from-slate-900 via-red-950 to-rose-950',
    accent: '#ef4444', glow: 'rgba(239,68,68,0.18)',
  },
};

export default function GuardianCenter({ studentId }) {
  const navigate = useNavigate();

  const [digest, setDigest]           = useState(null);
  const [prefs, setPrefs]             = useState(null);
  const [loading, setLoading]         = useState(true);
  const [scanning, setScanning]       = useState(false);
  const [tgState, setTgState]         = useState('idle');
  const [alertsOpen, setAlertsOpen]   = useState(false);
  const pollRef                       = useRef(null);

  const studentName = (sessionStorage.getItem('studentName') || '').split(' ')[0] || '';

  const load = useCallback(async () => {
    try {
      const [d, p] = await Promise.all([
        api.getDigestPreview(studentId),
        api.getNotificationPreferences(studentId),
      ]);
      setDigest(d);
      setPrefs(p);
      if (p.telegram_chat_id) setTgState('connected');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const runScan = async () => {
    setScanning(true);
    try {
      await api.runDeadlineScan(studentId);
      const d = await api.getDigestPreview(studentId);
      setDigest(d);
    } finally {
      setScanning(false);
    }
  };

  const toggleEmail = async (val) => {
    try {
      const updated = await api.updateNotificationPreferences(studentId, { email_enabled: val });
      setPrefs(updated);
    } catch {}
  };

  const connectTelegram = async () => {
    if (tgState === 'connected' || tgState === 'loading' || tgState === 'waiting') return;
    setTgState('loading');
    try {
      const res = await api.getTelegramLink(studentId);
      if (res.connected) { setTgState('connected'); return; }
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
    } catch {
      setTgState('idle');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-4">
        <span className="text-6xl animate-pulse">🛡️</span>
        <p className="text-slate-400 font-semibold tracking-wide">Preparing your path...</p>
      </div>
    );
  }

  const risk   = digest?.risk_status || 'safe';
  const rc     = RISK_CFG[risk];
  const dCount = digest?.upcoming_deadlines?.length || 0;
  const cCount = digest?.course_progress?.length    || 0;
  const lCount = digest?.incomplete_lessons         || 0;
  const actions = buildActions(digest);

  return (
    <div className="space-y-5 pb-8">

      {/* ── HERO ──────────────────────────────────────────── */}
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${rc.grad} text-white p-8`}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full" style={{ background: rc.accent, opacity: 0.13, filter: 'blur(90px)' }} />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full" style={{ background: '#818cf8', opacity: 0.08, filter: 'blur(70px)' }} />
        </div>

        <div className="relative">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-5xl leading-none">🛡️</span>
                <div>
                  <h2 className="text-2xl font-black leading-tight">Mentoria Guardian</h2>
                  <p className="text-slate-300 text-sm">
                    {studentName ? `Hey ${studentName} — here's your focus for today` : 'Your personal education navigator'}
                  </p>
                </div>
              </div>

              <div
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full"
                style={{ background: rc.glow, border: `1px solid ${rc.accent}50` }}
              >
                <span className="text-base">{rc.emoji}</span>
                <span className="font-black text-base" style={{ color: rc.accent }}>{rc.label}</span>
                <span className="text-slate-500 text-sm">·</span>
                <span className="text-slate-300 text-sm">{rc.sub}</span>
              </div>
            </div>

            <button
              onClick={runScan}
              disabled={scanning}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/20 border border-white/20 transition-all disabled:opacity-50 whitespace-nowrap"
            >
              {scanning ? '⏳' : '🔄'} {scanning ? 'Updating...' : 'Refresh'}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
            {[
              { icon: '📅', val: dCount, label: 'Upcoming deadlines' },
              { icon: '📚', val: cCount, label: 'Active courses' },
              { icon: '⚡', val: lCount, label: 'Lessons pending' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl leading-none">{s.icon}</p>
                <p className="text-3xl font-black text-white mt-2 leading-none">{s.val}</p>
                <p className="text-xs text-slate-300 mt-1.5 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PRIORITY ACTIONS ──────────────────────────────── */}
      {actions.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-black text-slate-900 dark:text-white text-lg px-1">
            What to do today
          </h3>
          {actions.map((action, i) => {
            const c = COLOR[action.color];
            return (
              <div key={i} className={`rounded-2xl border-2 p-5 ${c.border} ${c.bg}`}>
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl leading-none flex-shrink-0 mt-0.5">{action.icon}</span>
                  <div className="min-w-0 flex-1">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black tracking-wider mb-1.5 ${c.badge}`}>
                      {action.badge}
                    </span>
                    <p className="font-bold text-slate-900 dark:text-white leading-snug">{action.title}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 ml-10 mb-4 leading-relaxed">{action.desc}</p>
                <div className="ml-10">
                  <button
                    onClick={() => navigate(action.link)}
                    className={`px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${c.btn}`}
                  >
                    {action.cta} →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── UPCOMING OPPORTUNITIES ────────────────────────── */}
      {digest?.upcoming_deadlines?.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">🎯 Saved Opportunities</h3>
              <p className="text-xs text-slate-400 mt-0.5">Opportunities you're tracking</p>
            </div>
            <button
              onClick={() => navigate('/opportunities')}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Browse all →
            </button>
          </div>
          <div className="p-4 space-y-2">
            {digest.upcoming_deadlines.map(d => {
              const isUrgent = d.days_left <= 1;
              const isClose  = d.days_left <= 7;
              const barCls   = isUrgent ? 'bg-red-500'   : isClose ? 'bg-amber-500' : 'bg-blue-400';
              const badgeCls = isUrgent
                ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                : isClose
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
              const dLabel = d.days_left === 0 ? 'Today' : d.days_left === 1 ? 'Tomorrow' : `${d.days_left}d`;

              return (
                <div key={d.id} className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  <div className={`w-1.5 h-10 rounded-full flex-shrink-0 ${barCls}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{d.title}</p>
                    <p className="text-xs text-slate-400 capitalize mt-0.5">{d.category}</p>
                  </div>
                  <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold ${badgeCls}`}>
                    {isUrgent ? '🔴 ' : isClose ? '🟡 ' : ''}{dLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── LEARNING JOURNEY ──────────────────────────────── */}
      {digest?.course_progress?.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">📈 Your Learning Journey</h3>
              <p className="text-xs text-slate-400 mt-0.5">Every lesson moves you closer to your goals</p>
            </div>
            <button
              onClick={() => navigate('/courses')}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              All courses →
            </button>
          </div>
          <div className="p-4 space-y-4">
            {digest.course_progress.map(c => {
              const pct   = c.progress;
              const done  = pct >= 100;
              const icon  = done ? '🏆' : pct > 50 ? '🔥' : pct > 0 ? '📖' : '🚀';
              const color = done ? '#22c55e' : pct > 50 ? '#f59e0b' : '#6366f1';
              const bar   = done
                ? '#22c55e'
                : pct > 50
                  ? 'linear-gradient(90deg,#f59e0b,#ef4444)'
                  : 'linear-gradient(90deg,#6366f1,#3b82f6)';

              return (
                <div key={c.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl leading-none">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{c.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {pct === 0 ? 'Not started yet' : done ? 'Completed! 🎉' : `${pct.toFixed(0)}% done`}
                      </p>
                    </div>
                    <span className="font-black text-xl leading-none" style={{ color }}>{pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct > 0 ? Math.max(pct, 3) : 0}%`, background: bar, transition: 'width 0.8s ease' }}
                    />
                  </div>
                  {!done && (
                    <button
                      onClick={() => navigate('/courses')}
                      className="mt-3 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      {pct > 0 ? 'Continue →' : 'Start course →'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── GUARDIAN ALERTS ───────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm">
        <button
          onClick={() => setAlertsOpen(v => !v)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🔔</span>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Stay Updated</p>
              <p className="text-xs text-slate-400 mt-0.5">Get alerts for deadlines and progress</p>
            </div>
            {(prefs?.email_enabled || tgState === 'connected') && (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active
              </span>
            )}
          </div>
          <span className={`text-slate-400 text-xs transition-transform duration-200 ${alertsOpen ? 'rotate-180' : ''}`}>▼</span>
        </button>

        {alertsOpen && (
          <div className="border-t border-slate-100 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700">

            {/* Email */}
            <div className="px-6 py-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">📧 Weekly Email Report</p>
                <p className="text-xs text-slate-400 mt-0.5">Summary of your progress every week</p>
              </div>
              <button
                onClick={() => toggleEmail(!prefs?.email_enabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
                  prefs?.email_enabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  prefs?.email_enabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Telegram */}
            <div className="px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">✈️ Telegram Notifications</p>
                  <p className="text-xs text-slate-400 mt-0.5">Instant alerts when deadlines approach</p>
                </div>

                {tgState === 'connected' ? (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Connected
                  </span>
                ) : (
                  <button
                    onClick={connectTelegram}
                    disabled={tgState === 'loading'}
                    className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                      tgState === 'waiting'
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 cursor-wait'
                        : tgState === 'loading'
                          ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-wait'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                    }`}
                  >
                    {tgState === 'loading' ? '⏳'
                     : tgState === 'waiting' ? '⏳ Waiting...'
                     : 'Connect Telegram'}
                  </button>
                )}
              </div>

              {tgState === 'waiting' && (
                <div className="mt-3 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                  <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">
                    Open Telegram and tap Start
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Your account will be linked automatically once you start the bot.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
