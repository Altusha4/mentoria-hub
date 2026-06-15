import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const cleanContent = (text) => {
  if (!text) return '';
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/_{1,2}([^_]+)_{1,2}/g, '$1')
    .replace(/`{1,3}([^`]+)`{1,3}/g, '$1');
};

const truncateText = (text, limit = 100) => {
  if (!text) return '';
  if (text.length <= limit) return text;
  return text.substring(0, limit).trim() + '...';
};

const CATEGORY_LABELS = {
  hiring: { emoji: '💼', label: 'Hiring', color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
  programs: { emoji: '📚', label: 'Programs', color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' },
  opportunities: { emoji: '🎯', label: 'Opportunities', color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' },
  news: { emoji: '📢', label: 'News', color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' },
  tips: { emoji: '💡', label: 'Tips', color: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' },
  general: { emoji: '⭐', label: 'General', color: 'bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800' },
};

// Modal компонент
function PostModal({ post, isOpen, onClose }) {
  if (!isOpen || !post) return null;

  const label = CATEGORY_LABELS[post.category] || CATEGORY_LABELS.general;
  const telegramLink = `https://t.me/mentoria_updates/${post.telegram_message_id}`;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Close Button */}
        <div className="sticky top-0 flex items-center justify-between p-6 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 z-10">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{label.emoji}</span>
            <span className="font-bold text-gray-800 dark:text-white">{label.label}</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {cleanContent(post.title)}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              📅{' '}
              {new Date(post.posted_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <div>
              🕐{' '}
              {new Date(post.posted_at).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-slate-700" />

          {/* Full Content */}
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg text-gray-800 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {cleanContent(post.content)}
            </p>
          </div>

          {/* Summary if exists */}
          {post.summary && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="font-semibold text-blue-900 dark:text-blue-300 mb-2">✨ Summary:</div>
              <p className="text-blue-800 dark:text-blue-200">{post.summary}</p>
            </div>
          )}

          {/* Post Info if exists */}
          {post.post_info && (
            <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
              <div className="font-semibold text-gray-900 dark:text-white mb-3">📋 Post Information:</div>
              {(() => {
                try {
                  const data = JSON.parse(post.post_info);
                  return (
                    <div className="space-y-3 text-sm">
                      {data.audience && (
                        <div>
                          <div className="text-gray-600 dark:text-gray-400 font-semibold">👥 For whom:</div>
                          <div className="text-gray-800 dark:text-gray-200">{data.audience}</div>
                        </div>
                      )}
                      {data.deadline && (
                        <div>
                          <div className="text-gray-600 dark:text-gray-400 font-semibold">⏰ Deadline:</div>
                          <div className="text-gray-800 dark:text-gray-200">{data.deadline}</div>
                        </div>
                      )}
                      {data.organizer && (
                        <div>
                          <div className="text-gray-600 dark:text-gray-400 font-semibold">🏢 Organizer:</div>
                          <div className="text-gray-800 dark:text-gray-200">{data.organizer}</div>
                        </div>
                      )}
                      {data.format && (
                        <div>
                          <div className="text-gray-600 dark:text-gray-400 font-semibold">📍 Format:</div>
                          <div className="text-gray-800 dark:text-gray-200">{data.format}</div>
                        </div>
                      )}
                      {data.requirements && (
                        <div>
                          <div className="text-gray-600 dark:text-gray-400 font-semibold">💼 Requirements:</div>
                          <div className="text-gray-800 dark:text-gray-200">{data.requirements}</div>
                        </div>
                      )}
                      {data.benefits && (
                        <div>
                          <div className="text-gray-600 dark:text-gray-400 font-semibold">🎁 Benefits:</div>
                          <div className="text-gray-800 dark:text-gray-200">{data.benefits}</div>
                        </div>
                      )}
                    </div>
                  );
                } catch (e) {
                  return null;
                }
              })()}
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-slate-700" />

          {/* CTA Buttons */}
          <div className="flex gap-3 pt-4">
            <a
              href={telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              <span>📱</span>
              Open in Telegram
            </a>
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Updates() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchPostsByCategory(selectedCategory);
  }, [selectedCategory]);

  const fetchData = async () => {
    try {
      const [postsData, categoriesData] = await Promise.all([
        api.getTelegramPosts(126),
        api.getTelegramCategories(),
      ]);
      setPosts(postsData);
      setCategories(categoriesData.categories || []);
    } catch (error) {
      console.error('Error fetching Telegram data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostsByCategory = async (category) => {
    try {
      const data = await api.getTelegramPosts(126, category === 'all' ? null : category);
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const openModal = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">🔄</div>
          <p className="text-gray-700 dark:text-gray-300 text-lg">Loading updates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-5xl">📢</span>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">Latest Updates</h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">From @mentoria_updates — {posts.length} posts</p>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-10">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'
              }`}
            >
              All ({posts.length})
            </button>
            {categories.map((cat) => {
              const label = CATEGORY_LABELS[cat.name];
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2 rounded-full font-semibold transition-all flex items-center gap-2 ${
                    selectedCategory === cat.name
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'
                  }`}
                >
                  <span>{label?.emoji}</span>
                  {label?.label} ({cat.count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 dark:text-gray-400 text-xl">No updates available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const label = CATEGORY_LABELS[post.category] || CATEGORY_LABELS.general;
              return (
                <div
                  key={post.id}
                  className={`rounded-xl border-2 p-5 transition-all hover:shadow-lg hover:scale-105 cursor-pointer ${label.color}`}
                  onClick={() => openModal(post)}
                >
                  {/* Category Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{label.emoji}</span>
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      {label.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {cleanContent(post.title)}
                  </h3>

                  {/* Content Preview */}
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                    {cleanContent(truncateText(post.content, 120))}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-300 dark:border-gray-600">
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(post.posted_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(post);
                      }}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
                    >
                      Read more →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center">
          <a
            href="https://t.me/mentoria_updates"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Subscribe to @mentoria_updates
            <span>→</span>
          </a>
        </div>
      </div>

      {/* Modal */}
      <PostModal post={selectedPost} isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}
