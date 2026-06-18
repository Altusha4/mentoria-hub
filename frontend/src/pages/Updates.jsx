import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useTheme } from '../context/ThemeContext';

/* ─── Utils ─────────────────────────────────────── */
const cleanContent = (text) => {
  if (!text) return '';
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/_{1,2}([^_]+)_{1,2}/g, '$1')
    .replace(/`{1,3}([^`]+)`{1,3}/g, '$1');
};

const truncateText = (text, limit = 140) => {
  if (!text) return '';
  if (text.length <= limit) return text;
  return text.substring(0, limit).trim() + '…';
};

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const formatDateFull = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const formatTime = (dateStr) =>
  new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

/* ─── Category config — color accents, NO icons or emojis ── */
const CATEGORY_CONFIG = {
  hiring:        { label: 'Hiring',        color: '#3cc5e0', bg: 'rgba(60,197,224,0.08)',  border: 'rgba(60,197,224,0.2)'  },
  programs:      { label: 'Programs',      color: '#a855f7', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.2)' },
  opportunities: { label: 'Opportunities', color: '#20c0a0', bg: 'rgba(32,192,160,0.08)', border: 'rgba(32,192,160,0.2)' },
  news:          { label: 'News',          color: '#f97316', bg: 'rgba(249,115,22,0.08)',  border: 'rgba(249,115,22,0.2)'  },
  tips:          { label: 'Tips',          color: '#ffd700', bg: 'rgba(255,215,0,0.08)',   border: 'rgba(255,215,0,0.2)'   },
  general:       { label: 'General',       color: '#6b7280', bg: 'rgba(107,114,128,0.06)', border: 'rgba(107,114,128,0.15)' },
};
const DEFAULT_CAT = CATEGORY_CONFIG.general;

/* ─── Skeleton ────────────────────────────────── */
function CardSkeleton({ theme }) {
  return (
    <div className={`rounded-2xl overflow-hidden animate-pulse border ${
      theme === 'dark' ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-white border-gray-100'
    }`}>
      <div className={`h-1.5 ${theme === 'dark' ? 'bg-white/[0.08]' : 'bg-gray-100'}`} />
      <div className="p-6 space-y-3">
        <div className={`h-3 w-16 rounded-full ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-gray-100'}`} />
        <div className={`h-5 w-full rounded-lg ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-gray-200'}`} />
        <div className={`h-5 w-3/4 rounded-lg ${theme === 'dark' ? 'bg-white/[0.05]' : 'bg-gray-150'}`} />
        <div className={`h-4 w-full rounded ${theme === 'dark' ? 'bg-white/[0.04]' : 'bg-gray-100'}`} />
        <div className={`h-4 w-2/3 rounded ${theme === 'dark' ? 'bg-white/[0.04]' : 'bg-gray-100'}`} />
      </div>
    </div>
  );
}

/* ─── Post Card ────────────────────────────────── */
function PostCard({ post, onClick, theme, index }) {
  const cat = CATEGORY_CONFIG[post.category] || DEFAULT_CAT;

  return (
    <div
      onClick={() => onClick(post)}
      className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 border mentoria-fadeInUp
        ${theme === 'dark'
          ? 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12]'
          : 'bg-white border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200'
        }`}
      style={{ animationDelay: `${Math.min(index * 0.04, 0.3)}s`, opacity: 0 }}
    >
      {/* Top color bar */}
      <div className="h-[3px] w-full" style={{ background: `linear-gradient(90deg, ${cat.color}, transparent)` }} />

      <div className="p-6">
        {/* Category pill — pure text, colored */}
        <div className="flex items-center justify-between mb-4">
          <span
            className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md"
            style={{ color: cat.color, background: cat.bg }}
          >
            {cat.label}
          </span>
          <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
            {formatDate(post.posted_at)}
          </span>
        </div>

        {/* Title */}
        <h3 className={`font-bold text-[15px] leading-snug mb-3 line-clamp-3 transition-colors duration-200
          ${theme === 'dark'
            ? 'text-white group-hover:text-[#3cc5e0]'
            : 'text-gray-900 group-hover:text-[#2195c4]'
          }`}
        >
          {cleanContent(post.title)}
        </h3>

        {/* Preview */}
        <p className={`text-sm leading-relaxed line-clamp-3 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
          {cleanContent(truncateText(post.content, 160))}
        </p>

        {/* Footer */}
        <div className={`flex items-center justify-between mt-5 pt-4 border-t
          ${theme === 'dark' ? 'border-white/[0.05]' : 'border-gray-100'}`}>
          {/* Left accent line */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-[2px] rounded-full transition-all duration-300 group-hover:w-8"
              style={{ background: cat.color }} />
            <span className="text-xs font-semibold" style={{ color: cat.color }}>
              Read more
            </span>
          </div>
          <span className={`text-xs ${theme === 'dark' ? 'text-gray-700' : 'text-gray-300'}`}>
            #{post.id}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal ────────────────────────────────────── */
function PostModal({ post, isOpen, onClose, theme }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || !post) return null;

  const cat = CATEGORY_CONFIG[post.category] || DEFAULT_CAT;
  const telegramLink = `https://t.me/mentoria_updates/${post.telegram_message_id}`;

  let postInfoData = null;
  if (post.post_info) {
    try { postInfoData = JSON.parse(post.post_info); } catch {}
  }

  const infoFields = postInfoData ? [
    { key: 'audience',     label: 'For whom' },
    { key: 'deadline',     label: 'Deadline' },
    { key: 'organizer',    label: 'Organizer' },
    { key: 'format',       label: 'Format' },
    { key: 'requirements', label: 'Requirements' },
    { key: 'benefits',     label: 'Benefits' },
  ].filter(f => postInfoData[f.key]) : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={`relative w-full max-w-2xl max-h-[88vh] overflow-hidden rounded-2xl shadow-2xl mentoria-fadeInScale flex flex-col
          ${theme === 'dark'
            ? 'bg-[#0d1926] border border-white/[0.08]'
            : 'bg-white border border-gray-100'
          }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal top bar */}
        <div className="h-[3px]" style={{ background: `linear-gradient(90deg, ${cat.color}, transparent)` }} />

        {/* Modal Header */}
        <div className={`flex items-center justify-between px-7 py-5 border-b flex-shrink-0
          ${theme === 'dark' ? 'border-white/[0.06]' : 'border-gray-100'}`}>
          <div className="flex items-center gap-3">
            <span
              className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md"
              style={{ color: cat.color, background: cat.bg }}
            >
              {cat.label}
            </span>
            <div className={`w-px h-4 ${theme === 'dark' ? 'bg-white/[0.1]' : 'bg-gray-200'}`} />
            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              {formatDateFull(post.posted_at)} · {formatTime(post.posted_at)}
            </span>
          </div>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors font-medium text-lg
              ${theme === 'dark'
                ? 'text-gray-500 hover:text-white hover:bg-white/[0.06]'
                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
              }`}
          >
            ×
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          <div className="px-7 py-6 space-y-6">
            {/* Title */}
            <h2 className={`text-2xl font-bold leading-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {cleanContent(post.title)}
            </h2>

            {/* Full content */}
            <p className={`text-base leading-relaxed whitespace-pre-wrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {cleanContent(post.content)}
            </p>

            {/* Summary box */}
            {post.summary && (
              <div className={`rounded-xl p-5 border-l-4`}
                style={{
                  background: cat.bg,
                  borderLeftColor: cat.color,
                  borderTop: `1px solid ${cat.border}`,
                  borderRight: `1px solid ${cat.border}`,
                  borderBottom: `1px solid ${cat.border}`,
                }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: cat.color }}>
                  Summary
                </p>
                <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {post.summary}
                </p>
              </div>
            )}

            {/* Post Info fields */}
            {infoFields.length > 0 && (
              <div className={`rounded-xl overflow-hidden border ${theme === 'dark' ? 'border-white/[0.06]' : 'border-gray-100'}`}>
                <div className={`px-5 py-3 border-b ${theme === 'dark' ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-gray-50 border-gray-100'}`}>
                  <p className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Post Details
                  </p>
                </div>
                <div className="divide-y">
                  {infoFields.map(field => (
                    <div key={field.key}
                      className={`flex gap-6 px-5 py-3.5 ${theme === 'dark' ? 'divide-white/[0.04] border-white/[0.04]' : 'divide-gray-100 border-gray-100'}`}
                    >
                      <span className={`text-xs font-semibold w-24 flex-shrink-0 pt-0.5 uppercase tracking-wide ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        {field.label}
                      </span>
                      <span className={`text-sm flex-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {postInfoData[field.key]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className={`flex gap-3 px-7 py-5 border-t flex-shrink-0
          ${theme === 'dark' ? 'border-white/[0.06] bg-white/[0.02]' : 'border-gray-100 bg-gray-50/50'}`}>
          <a
            href={telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold text-white rounded-xl transition-all duration-300 hover:opacity-90 hover:shadow-md"
            style={{ background: `linear-gradient(135deg, ${cat.color}, #2195c4)` }}
          >
            Open in Telegram
          </a>
          <button
            onClick={onClose}
            className={`flex-1 py-3 text-sm font-bold rounded-xl border transition-all duration-200
              ${theme === 'dark'
                ? 'border-white/[0.1] text-gray-300 hover:bg-white/[0.04]'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Filter Chip ─────────────────────────────── */
function Chip({ label, count, active, color, onClick, theme }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap border
        ${active
          ? 'text-white border-transparent shadow-sm'
          : theme === 'dark'
            ? 'bg-white/[0.04] text-gray-400 border-white/[0.08] hover:bg-white/[0.08] hover:text-white'
            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-700'
        }`}
      style={active ? { background: `linear-gradient(135deg, ${color || '#3cc5e0'}, #2195c4)` } : {}}
    >
      {label}
      {count !== undefined && (
        <span className={`ml-1.5 text-xs font-bold ${active ? 'opacity-80' : theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

/* ─── Main Component ──────────────────────────── */
export default function Updates() {
  const { theme } = useTheme();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { fetchPostsByCategory(selectedCategory); }, [selectedCategory]);

  const fetchData = async () => {
    try {
      const [postsData, categoriesData] = await Promise.all([
        api.getTelegramPosts(50),
        api.getTelegramCategories(),
      ]);
      setPosts(postsData || []);
      setCategories(categoriesData?.categories || []);
    } catch {
      setPosts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostsByCategory = async (category) => {
    try {
      const data = await api.getTelegramPosts(50, category === 'all' ? null : category);
      setPosts(data || []);
    } catch {
      setPosts([]);
    }
  };

  const openModal = (post) => { setSelectedPost(post); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setSelectedPost(null); };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-[#060d18]' : 'bg-gray-50'}`}>

      {/* ════ HERO ════ */}
      <section className="relative overflow-hidden py-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0" style={{
          background: theme === 'dark'
            ? 'linear-gradient(135deg, #0a1628 0%, #001a35 40%, #0f1f2e 70%, #0a1628 100%)'
            : 'linear-gradient(135deg, #0c1e3a 0%, #0d2847 40%, #143352 70%, #0c1e3a 100%)'
        }} />
        {/* Orb */}
        <div className="absolute top-0 right-1/3 w-[400px] h-[400px] rounded-full mentoria-orbFloat opacity-15 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #3cc5e0 0%, transparent 70%)' }} />

        <div className="max-w-7xl mx-auto relative z-10 mentoria-fadeInUp">
          {/* Live dot + label */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.08] border border-white/[0.12] backdrop-blur-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-[#3cc5e0] animate-pulse" />
            <span className="text-sm font-medium text-[#b0e0f0]">Live from @mentoria_updates</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Latest{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #3cc5e0, #20c0a0)' }}>
              Updates
            </span>
          </h1>
          <p className="text-lg text-[#8bb8cc] max-w-xl leading-relaxed mb-8">
            Scholarships, internships, programs and industry news — curated and delivered in real time.
          </p>

          {/* Stats */}
          {!loading && (
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.1]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#20c0a0]" />
                <span className="text-sm font-medium text-white">{posts.length}</span>
                <span className="text-sm text-[#8bb8cc]">posts</span>
              </div>
              {categories.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.1]">
                  <span className="text-sm text-[#8bb8cc]">{categories.length} categories</span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ════ CONTENT ════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8 mentoria-fadeInUp mentoria-delay-1">
          <Chip
            label="All"
            count={selectedCategory === 'all' ? posts.length : undefined}
            active={selectedCategory === 'all'}
            color="#3cc5e0"
            onClick={() => setSelectedCategory('all')}
            theme={theme}
          />
          {categories.map(cat => {
            const cfg = CATEGORY_CONFIG[cat.name] || DEFAULT_CAT;
            return (
              <Chip
                key={cat.name}
                label={cfg.label}
                count={cat.count}
                active={selectedCategory === cat.name}
                color={cfg.color}
                onClick={() => setSelectedCategory(cat.name)}
                theme={theme}
              />
            );
          })}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <CardSkeleton key={i} theme={theme} />)}
          </div>
        ) : posts.length === 0 ? (
          <div className={`text-center py-20 rounded-2xl ${theme === 'dark' ? 'bg-white/[0.02]' : 'bg-white border border-gray-100'}`}>
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(60,197,224,0.08), rgba(32,192,160,0.08))' }}>
              <span className="w-6 h-6 rounded-full border-2 border-[#3cc5e0] opacity-40" />
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              No updates yet
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              Check back soon or switch category
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                onClick={openModal}
                theme={theme}
                index={index}
              />
            ))}
          </div>
        )}

        {/* CTA Banner */}
        {!loading && posts.length > 0 && (
          <div className={`mt-16 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border mentoria-fadeInUp
            ${theme === 'dark'
              ? 'bg-white/[0.03] border-white/[0.06]'
              : 'bg-white border-gray-100 shadow-sm'
            }`}
          >
            <div>
              <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                Stay in the loop
              </p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Get updates directly in Telegram
              </p>
              <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                Never miss an opportunity — subscribe to @mentoria_updates
              </p>
            </div>
            <a
              href="https://t.me/mentoria_updates"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-2 px-7 py-3.5 text-sm font-bold text-white rounded-xl transition-all duration-300 hover:opacity-90 hover:shadow-lg hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #3cc5e0, #2195c4)' }}
            >
              Subscribe
              <span className="text-base opacity-80">→</span>
            </a>
          </div>
        )}
      </div>

      {/* Modal */}
      <PostModal post={selectedPost} isOpen={isModalOpen} onClose={closeModal} theme={theme} />
    </div>
  );
}
