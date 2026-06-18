import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useTheme } from '../context/ThemeContext';

/* ════════════════════════════════════════════
   PROFILE PAGE — full redesign
   Design system: dark navy hero + glass cards
   Tabs: inline, no emoji, colored underline
   ════════════════════════════════════════════ */

/* ─── Completeness calculator ─────────────── */
const COMPLETENESS_FIELDS = [
  'bio', 'interests', 'subjects', 'goals',
  'gpa', 'ielts_score', 'activities', 'certificates',
  'cv_text', 'motivation_letter',
];
function getCompleteness(profile) {
  if (!profile) return 0;
  const filled = COMPLETENESS_FIELDS.filter(f => {
    const v = profile[f];
    return v !== null && v !== undefined && v !== '' && v !== 0;
  }).length;
  return Math.round((filled / COMPLETENESS_FIELDS.length) * 100);
}

/* ─── Avatar initials ─────────────────────── */
function Initials({ first, last, size = 'lg' }) {
  const letters = `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase() || '?';
  const cls = size === 'lg' ? 'w-24 h-24 text-3xl' : 'w-10 h-10 text-sm';
  return (
    <div
      className={`${cls} rounded-2xl flex items-center justify-center font-black text-white flex-shrink-0 select-none`}
      style={{ background: 'linear-gradient(135deg, #3cc5e0 0%, #2195c4 50%, #20c0a0 100%)' }}
    >
      {letters}
    </div>
  );
}

/* ─── Completeness Ring ──────────────────── */
function CompletenessRing({ pct, theme }) {
  const r = 20;
  const c = 2 * Math.PI * r;
  const color = pct >= 80 ? '#20c0a0' : pct >= 50 ? '#3cc5e0' : '#f59e0b';
  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
        <circle cx="24" cy="24" r={r} fill="none"
          stroke={theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#e5e7eb'} strokeWidth="4" />
        <circle cx="24" cy="24" r={r} fill="none"
          stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-black" style={{ color }}>{pct}%</span>
      </div>
    </div>
  );
}

/* ─── Score Bar (for GPA/test scores) ───────── */
function ScoreBar({ value, max, color = '#3cc5e0', theme }) {
  const pct = value ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className={`h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-gray-100'}`}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)` }}
      />
    </div>
  );
}

/* ─── Field Input (edit mode) ────────────────── */
function FieldInput({ type = 'text', value, onChange, placeholder, rows, className = '' }) {
  const { theme } = useTheme();
  const base = `w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 border
    ${theme === 'dark'
      ? 'bg-white/[0.04] border-white/[0.1] text-white placeholder-gray-600 focus:border-[#3cc5e0]/50 focus:bg-white/[0.07]'
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#3cc5e0] focus:shadow-[0_0_0_3px_rgba(60,197,224,0.08)]'
    } ${className}`;

  if (type === 'textarea') {
    return <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} className={base} />;
  }
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder} className={base} />;
}

/* ─── Section card wrapper ────────────────── */
function SectionCard({ children, theme, accentColor }) {
  return (
    <div
      className={`rounded-2xl overflow-hidden border transition-colors
        ${theme === 'dark'
          ? 'bg-white/[0.03] border-white/[0.06]'
          : 'bg-white border-gray-100 shadow-sm'
        }`}
    >
      {accentColor && <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }} />}
      <div className="p-6">{children}</div>
    </div>
  );
}

/* ─── Section header ─────────────────────── */
function SectionTitle({ label, theme, color = '#3cc5e0' }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-1 h-5 rounded-full" style={{ background: color }} />
      <h3 className={`font-bold text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{label}</h3>
    </div>
  );
}

/* ─── Info row (view mode) ───────────────── */
function InfoRow({ label, value, theme }) {
  const empty = !value || value === '';
  return (
    <div className="flex gap-4">
      <span className={`text-xs font-semibold uppercase tracking-wider w-24 flex-shrink-0 pt-0.5
        ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
        {label}
      </span>
      <span className={`text-sm leading-relaxed flex-1
        ${empty
          ? theme === 'dark' ? 'text-gray-700 italic' : 'text-gray-300 italic'
          : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
        {empty ? 'Not filled yet' : value}
      </span>
    </div>
  );
}

/* ─── Tag list ────────────────────────────── */
function TagList({ value, color, theme }) {
  if (!value) return (
    <p className={`text-sm italic ${theme === 'dark' ? 'text-gray-700' : 'text-gray-300'}`}>Not filled yet</p>
  );
  const tags = value.split(',').map(t => t.trim()).filter(Boolean);
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, i) => (
        <span
          key={i}
          className="px-3 py-1 rounded-lg text-xs font-medium"
          style={{ background: `${color}14`, color }}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   TABS CONFIG
   ═══════════════════════════════════════════ */
const TABS = [
  { id: 'overview',   label: 'Overview',   color: '#3cc5e0' },
  { id: 'academics',  label: 'Academics',  color: '#20c0a0' },
  { id: 'activities', label: 'Activities', color: '#a855f7' },
  { id: 'documents',  label: 'Documents',  color: '#f97316' },
  { id: 'saved',      label: 'Saved',      color: '#e23670' },
  { id: 'courses',    label: 'My Courses', color: '#6366f1' },
];

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function Profile({ studentId }) {
  const { theme } = useTheme();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState({});
  const [savedOpps, setSavedOpps] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const stickyRef = useRef(null);

  useEffect(() => {
    if (studentId) loadProfile();
  }, [studentId]);

  const loadProfile = async () => {
    try {
      const data = await api.getStudent(studentId);
      setProfile(data);
      setFormData(data);

      const [savedResp, coursesResp] = await Promise.all([
        api.getSavedOpportunities(studentId).catch(() => []),
        api.getEnrolledCourses(studentId).catch(() => [])
      ]);
      setSavedOpps(savedResp);
      setEnrolledCourses(coursesResp);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateStudent(studentId, formData);
      setProfile(formData);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const set = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  /* ── Loading ── */
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#060d18]' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center animate-pulse"
            style={{ background: 'linear-gradient(135deg, rgba(60,197,224,0.15), rgba(32,192,160,0.15))' }}>
            <div className="w-8 h-8 rounded-full border-2 border-[#3cc5e0] border-t-transparent animate-spin" />
          </div>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            Loading profile…
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#060d18]' : 'bg-gray-50'}`}>
        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No profile data found.</p>
      </div>
    );
  }

  const completeness = getCompleteness(profile);
  const activeTabObj = TABS.find(t => t.id === activeTab);
  const displayData = editing ? formData : profile;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-[#060d18]' : 'bg-gray-50'}`}>

      {/* ════ HERO ════════════════════════════════ */}
      <div className="relative overflow-hidden" style={{
        background: theme === 'dark'
          ? 'linear-gradient(135deg, #0a1628 0%, #001a35 40%, #0f1f2e 100%)'
          : 'linear-gradient(135deg, #0c1e3a 0%, #0d2847 50%, #0f1f2e 100%)'
      }}>
        {/* Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[400px] rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #3cc5e0, transparent 70%)' }} />
        <div className="absolute bottom-0 left-1/4 w-[350px] h-[300px] rounded-full blur-3xl opacity-08 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #20c0a0, transparent 70%)' }} />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <Initials first={profile.first_name} last={profile.last_name} size="lg" />

            {/* Name + meta */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-1">
                {profile.first_name} {profile.last_name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {profile.grade && (
                  <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg"
                    style={{ background: 'rgba(60,197,224,0.12)', color: '#3cc5e0' }}>
                    Grade {profile.grade}
                  </span>
                )}
                {profile.email && (
                  <span className="text-sm text-slate-400 font-medium">{profile.email}</span>
                )}
              </div>
            </div>

            {/* Completeness ring + Edit button */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="text-center">
                <CompletenessRing pct={completeness} theme={theme} />
                <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-wider">Complete</p>
              </div>

              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, #3cc5e0, #2195c4)' }}
                >
                  <span className="text-base leading-none">✎</span>
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90 disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #20c0a0, #1db896)' }}
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={() => { setEditing(false); setFormData(profile); }}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200
                      ${theme === 'dark'
                        ? 'border-white/[0.12] text-gray-400 hover:bg-white/[0.05]'
                        : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Completeness progress bar */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Profile completeness
              </span>
              <span className="text-xs font-bold" style={{ color: completeness >= 80 ? '#20c0a0' : completeness >= 50 ? '#3cc5e0' : '#f59e0b' }}>
                {completeness}%
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden bg-white/[0.06]">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${completeness}%`,
                  background: completeness >= 80
                    ? 'linear-gradient(90deg, #20c0a0, #22c55e)'
                    : completeness >= 50
                      ? 'linear-gradient(90deg, #3cc5e0, #2195c4)'
                      : 'linear-gradient(90deg, #f59e0b, #ef4444)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Tab bar — inside hero bottom */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" ref={stickyRef}>
          <div className="flex border-b border-white/[0.08]">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-5 py-4 text-sm font-semibold transition-all duration-200 whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'text-white'
                    : 'text-slate-500 hover:text-slate-300'
                  }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full"
                    style={{ background: tab.color }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ════ CONTENT ════════════════════════════ */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">

        {/* ── Saved toast ────────────────────── */}
        {saved && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl text-white shadow-2xl animate-pulse"
            style={{ background: 'linear-gradient(135deg, #20c0a0, #1db896)' }}>
            <span className="text-lg">✓</span>
            <span className="text-sm font-semibold">Profile saved successfully</span>
          </div>
        )}

        {/* ══════ TAB: OVERVIEW ══════════════════ */}
        {activeTab === 'overview' && (
          <>
            {/* Bio */}
            <SectionCard theme={theme} accentColor="#3cc5e0">
              <SectionTitle label="About" theme={theme} color="#3cc5e0" />
              {editing ? (
                <FieldInput
                  type="textarea"
                  value={formData.bio || ''}
                  onChange={e => set('bio', e.target.value)}
                  placeholder="Tell us about yourself, your goals, interests…"
                  rows={4}
                />
              ) : (
                <p className={`text-sm leading-relaxed ${
                  displayData.bio
                    ? theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    : theme === 'dark' ? 'text-gray-700 italic' : 'text-gray-300 italic'
                }`}>
                  {displayData.bio || 'No bio added yet. Click Edit to fill this in.'}
                </p>
              )}
            </SectionCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Interests */}
              <SectionCard theme={theme} accentColor="#a855f7">
                <SectionTitle label="Interests" theme={theme} color="#a855f7" />
                {editing ? (
                  <FieldInput
                    value={formData.interests || ''}
                    onChange={e => set('interests', e.target.value)}
                    placeholder="e.g. AI, Design, Business, Medicine…"
                  />
                ) : (
                  <TagList value={displayData.interests} color="#a855f7" theme={theme} />
                )}
              </SectionCard>

              {/* Subjects */}
              <SectionCard theme={theme} accentColor="#20c0a0">
                <SectionTitle label="Favourite Subjects" theme={theme} color="#20c0a0" />
                {editing ? (
                  <FieldInput
                    value={formData.subjects || ''}
                    onChange={e => set('subjects', e.target.value)}
                    placeholder="e.g. Math, Chemistry, English…"
                  />
                ) : (
                  <TagList value={displayData.subjects} color="#20c0a0" theme={theme} />
                )}
              </SectionCard>
            </div>

            {/* Goals */}
            <SectionCard theme={theme} accentColor="#f97316">
              <SectionTitle label="Goals & Ambitions" theme={theme} color="#f97316" />
              {editing ? (
                <FieldInput
                  type="textarea"
                  value={formData.goals || ''}
                  onChange={e => set('goals', e.target.value)}
                  placeholder="Where do you want to be in 5 years? What drives you?"
                  rows={3}
                />
              ) : (
                <p className={`text-sm leading-relaxed ${
                  displayData.goals
                    ? theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    : theme === 'dark' ? 'text-gray-700 italic' : 'text-gray-300 italic'
                }`}>
                  {displayData.goals || 'No goals added yet.'}
                </p>
              )}
            </SectionCard>
          </>
        )}

        {/* ══════ TAB: ACADEMICS ══════════════════ */}
        {activeTab === 'academics' && (
          <>
            {/* Score cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'GPA', key: 'gpa', max: 4.0, step: '0.1', color: '#3cc5e0', suffix: '/4.0' },
                { label: 'IELTS', key: 'ielts_score', max: 9, step: '0.5', color: '#20c0a0', suffix: '/9.0' },
                { label: 'TOEFL', key: 'toefl_score', max: 120, step: '1', color: '#a855f7', suffix: '/120' },
                { label: 'SAT', key: 'sat_score', max: 1600, step: '10', color: '#f97316', suffix: '/1600' },
              ].map(stat => {
                const val = displayData[stat.key];
                const hasVal = val !== null && val !== undefined && val !== '';
                return (
                  <div
                    key={stat.key}
                    className={`rounded-2xl p-5 border transition-colors
                      ${theme === 'dark'
                        ? 'bg-white/[0.03] border-white/[0.06]'
                        : 'bg-white border-gray-100 shadow-sm'
                      }`}
                  >
                    <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
                      {stat.label}
                    </p>
                    {editing ? (
                      <input
                        type="number"
                        step={stat.step}
                        value={formData[stat.key] || ''}
                        onChange={e => set(stat.key, e.target.value ? parseFloat(e.target.value) : null)}
                        placeholder="—"
                        className={`w-full text-xl font-black bg-transparent outline-none border-b pb-1 transition-colors
                          ${theme === 'dark'
                            ? 'text-white border-white/[0.1] focus:border-[#3cc5e0]'
                            : 'text-gray-900 border-gray-200 focus:border-[#3cc5e0]'
                          }`}
                        style={{ color: stat.color }}
                      />
                    ) : (
                      <p className="text-2xl font-black mb-1" style={{ color: hasVal ? stat.color : (theme === 'dark' ? '#374151' : '#d1d5db') }}>
                        {hasVal ? val : '—'}
                      </p>
                    )}
                    <p className={`text-xs mb-3 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>{stat.suffix}</p>
                    <ScoreBar value={hasVal ? val : 0} max={stat.max} color={stat.color} theme={theme} />
                  </div>
                );
              })}
            </div>

            {/* Transcript */}
            <SectionCard theme={theme} accentColor="#ffd700">
              <SectionTitle label="Transcript / Certificate" theme={theme} color="#ffd700" />
              {editing ? (
                <FieldInput
                  type="url"
                  value={formData.transcript_url || ''}
                  onChange={e => set('transcript_url', e.target.value)}
                  placeholder="https://example.com/your-transcript"
                />
              ) : displayData.transcript_url ? (
                <a
                  href={displayData.transcript_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#ffd700] hover:text-[#f0c000] transition-colors"
                >
                  View Transcript →
                </a>
              ) : (
                <p className={`text-sm italic ${theme === 'dark' ? 'text-gray-700' : 'text-gray-300'}`}>
                  No transcript link added yet.
                </p>
              )}
            </SectionCard>
          </>
        )}

        {/* ══════ TAB: ACTIVITIES ═════════════════ */}
        {activeTab === 'activities' && (
          <>
            <SectionCard theme={theme} accentColor="#20c0a0">
              <SectionTitle label="Sports & Extracurriculars" theme={theme} color="#20c0a0" />
              <p className={`text-xs mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
                e.g. "Football (3 years), Student Council, Debate Club"
              </p>
              {editing ? (
                <FieldInput
                  type="textarea"
                  value={formData.activities || ''}
                  onChange={e => set('activities', e.target.value)}
                  placeholder="List your activities, clubs, volunteering…"
                  rows={4}
                />
              ) : (
                <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                  displayData.activities
                    ? theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    : theme === 'dark' ? 'text-gray-700 italic' : 'text-gray-300 italic'
                }`}>
                  {displayData.activities || 'No activities added yet.'}
                </p>
              )}
            </SectionCard>

            <SectionCard theme={theme} accentColor="#ffd700">
              <SectionTitle label="Awards & Certificates" theme={theme} color="#ffd700" />
              <p className={`text-xs mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
                e.g. "Math Olympiad 1st place, Cambridge B2, Science Fair Winner"
              </p>
              {editing ? (
                <FieldInput
                  type="textarea"
                  value={formData.certificates || ''}
                  onChange={e => set('certificates', e.target.value)}
                  placeholder="List your awards, certificates, achievements…"
                  rows={4}
                />
              ) : (
                <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                  displayData.certificates
                    ? theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    : theme === 'dark' ? 'text-gray-700 italic' : 'text-gray-300 italic'
                }`}>
                  {displayData.certificates || 'No certificates added yet.'}
                </p>
              )}
            </SectionCard>
          </>
        )}

        {/* ══════ TAB: DOCUMENTS ══════════════════ */}
        {activeTab === 'documents' && (
          <>
            <SectionCard theme={theme} accentColor="#3cc5e0">
              <SectionTitle label="CV (Text)" theme={theme} color="#3cc5e0" />
              {editing ? (
                <FieldInput
                  type="textarea"
                  value={formData.cv_text || ''}
                  onChange={e => set('cv_text', e.target.value)}
                  placeholder="Paste your CV in text format…"
                  rows={8}
                  className="font-mono text-sm"
                />
              ) : displayData.cv_text ? (
                <pre className={`text-sm leading-relaxed whitespace-pre-wrap font-mono ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {displayData.cv_text}
                </pre>
              ) : (
                <p className={`text-sm italic ${theme === 'dark' ? 'text-gray-700' : 'text-gray-300'}`}>No CV text added yet.</p>
              )}
            </SectionCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* CV Video */}
              <SectionCard theme={theme} accentColor="#a855f7">
                <SectionTitle label="CV Video" theme={theme} color="#a855f7" />
                {editing ? (
                  <FieldInput
                    type="url"
                    value={formData.cv_video_url || ''}
                    onChange={e => set('cv_video_url', e.target.value)}
                    placeholder="YouTube or Vimeo link…"
                  />
                ) : displayData.cv_video_url ? (
                  <a
                    href={displayData.cv_video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#a855f7] hover:opacity-80 transition-opacity"
                  >
                    Watch CV Video →
                  </a>
                ) : (
                  <p className={`text-sm italic ${theme === 'dark' ? 'text-gray-700' : 'text-gray-300'}`}>No video link yet.</p>
                )}
              </SectionCard>

              {/* Transcript link shortcut */}
              <SectionCard theme={theme} accentColor="#f97316">
                <SectionTitle label="Transcript Link" theme={theme} color="#f97316" />
                {editing ? (
                  <FieldInput
                    type="url"
                    value={formData.transcript_url || ''}
                    onChange={e => set('transcript_url', e.target.value)}
                    placeholder="https://example.com/transcript"
                  />
                ) : displayData.transcript_url ? (
                  <a
                    href={displayData.transcript_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#f97316] hover:opacity-80 transition-opacity"
                  >
                    Open Transcript →
                  </a>
                ) : (
                  <p className={`text-sm italic ${theme === 'dark' ? 'text-gray-700' : 'text-gray-300'}`}>No transcript yet.</p>
                )}
              </SectionCard>
            </div>

            {/* Motivation Letter */}
            <SectionCard theme={theme} accentColor="#f97316">
              <SectionTitle label="Motivation Letter" theme={theme} color="#f97316" />
              {editing ? (
                <FieldInput
                  type="textarea"
                  value={formData.motivation_letter || ''}
                  onChange={e => set('motivation_letter', e.target.value)}
                  placeholder="Why are you passionate about your goals? What makes you unique?"
                  rows={7}
                />
              ) : displayData.motivation_letter ? (
                <p className={`text-sm leading-relaxed whitespace-pre-wrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {displayData.motivation_letter}
                </p>
              ) : (
                <p className={`text-sm italic ${theme === 'dark' ? 'text-gray-700' : 'text-gray-300'}`}>No motivation letter yet.</p>
              )}
            </SectionCard>
          </>
        )}

        {/* ══════ TAB: SAVED OPPORTUNITIES ════════ */}
        {activeTab === 'saved' && (
          <SectionCard theme={theme} accentColor="#e23670">
            <SectionTitle label="Saved Opportunities" theme={theme} color="#e23670" />
            {savedOpps.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedOpps.map(item => {
                  const opp = item.opportunity;
                  return (
                    <Link key={item.id} to={`/opportunities/${opp.id}`}
                      className={`block p-5 rounded-xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-md
                        ${theme === 'dark' 
                          ? 'bg-white/[0.02] border-white/[0.06] hover:border-[#e23670]/40' 
                          : 'bg-white border-gray-100 hover:border-[#e23670]/40'
                        }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#e23670] mb-1 block">
                        {opp.category || 'Opportunity'}
                      </span>
                      <h4 className={`font-bold text-sm mb-2 line-clamp-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {opp.title}
                      </h4>
                      {opp.format && (
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold
                          ${theme === 'dark' ? 'bg-white/[0.06] text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                          {opp.format}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className={`text-sm italic ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
                You haven't saved any opportunities yet.
              </p>
            )}
          </SectionCard>
        )}

        {/* ══════ TAB: COURSES ════════════════════ */}
        {activeTab === 'courses' && (
          <SectionCard theme={theme} accentColor="#6366f1">
            <SectionTitle label="Enrolled Courses" theme={theme} color="#6366f1" />
            {enrolledCourses.length > 0 ? (
              <div className="space-y-4">
                {enrolledCourses.map(item => {
                  const course = item.course;
                  const pct = Math.round(item.progress || 0);
                  return (
                    <Link key={item.id} to={`/courses/${course.id}`}
                      className={`flex flex-col sm:flex-row gap-4 p-5 rounded-xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-md
                        ${theme === 'dark' 
                          ? 'bg-white/[0.02] border-white/[0.06] hover:border-[#6366f1]/40' 
                          : 'bg-white border-gray-100 hover:border-[#6366f1]/40'
                        }`}
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#6366f1] mb-1 block">
                          Course
                        </span>
                        <h4 className={`font-bold text-sm mb-1 line-clamp-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {course.title}
                        </h4>
                        <p className={`text-xs line-clamp-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          {course.description}
                        </p>
                      </div>
                      
                      <div className="w-full sm:w-36 flex-shrink-0 flex flex-col justify-center">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className={`text-[10px] font-semibold uppercase tracking-widest ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            Progress
                          </span>
                          <span className="text-xs font-black text-[#6366f1]">{pct}%</span>
                        </div>
                        <div className={`h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-gray-100'}`}>
                          <div className="h-full bg-[#6366f1] rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className={`text-sm italic ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
                You are not enrolled in any courses yet.
              </p>
            )}
          </SectionCard>
        )}

        {/* ── Floating Save Bar (edit mode) ─── */}
        {editing && (
          <div className={`sticky bottom-6 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 shadow-2xl border backdrop-blur-md
            ${theme === 'dark'
              ? 'bg-[#0d1926]/90 border-white/[0.08]'
              : 'bg-white/90 border-gray-200'
            }`}
          >
            <div>
              <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Unsaved changes
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                Don't forget to save your profile
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => { setEditing(false); setFormData(profile); }}
                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all
                  ${theme === 'dark'
                    ? 'border-white/[0.1] text-gray-400 hover:bg-white/[0.05]'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #20c0a0, #1db896)' }}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
