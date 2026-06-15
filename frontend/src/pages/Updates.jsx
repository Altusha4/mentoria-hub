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

const truncateText = (text, limit = 150) => {
  if (!text) return '';
  if (text.length <= limit) return text;
  return text.substring(0, limit).trim() + '...';
};

const CATEGORY_LABELS = {
  hiring: { emoji: '💼', label: 'Hiring' },
  programs: { emoji: '📚', label: 'Programs' },
  opportunities: { emoji: '🎯', label: 'Opportunities' },
  news: { emoji: '📢', label: 'News' },
  tips: { emoji: '💡', label: 'Tips' },
  general: { emoji: '⭐', label: 'General' },
};

export default function Updates() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentIndex(0);
    fetchPostsByCategory(selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    if (posts.length > 0) {
      fetchSummary(posts[currentIndex].id);
    }
  }, [currentIndex, posts]);

  const fetchData = async () => {
    try {
      const [postsData, categoriesData] = await Promise.all([
        api.getTelegramPosts(100),
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
      const data = await api.getTelegramPosts(100, category === 'all' ? null : category);
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchSummary = async (postId) => {
    setSummaryLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/telegram/posts/${postId}/summary`);
      const data = await response.json();
      setSummary(data.summary || '');
    } catch (error) {
      console.error('Error fetching summary:', error);
      setSummary('');
    } finally {
      setSummaryLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % posts.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🔄</div>
          <p className="text-white text-lg">Loading updates...</p>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl">No updates available</p>
        </div>
      </div>
    );
  }

  const currentPost = posts[currentIndex];
  const postCategory = CATEGORY_LABELS[currentPost.category] || CATEGORY_LABELS.general;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-5xl">📢</span>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold">Latest Updates</h1>
              <p className="text-slate-400 text-lg">From @mentoria_updates</p>
            </div>
          </div>
          <div className="text-sm text-slate-400">
            {currentIndex + 1} / {posts.length} posts
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-12 overflow-x-auto pb-3">
          <div className="flex gap-2 min-w-min">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full font-semibold transition-all whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              }`}
            >
              All Posts
            </button>
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2 rounded-full font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                  selectedCategory === cat.name
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                }`}
              >
                <span>{CATEGORY_LABELS[cat.name]?.emoji}</span>
                {CATEGORY_LABELS[cat.name]?.label} ({cat.count})
              </button>
            ))}
          </div>
        </div>

        {/* Main Carousel */}
        <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 overflow-hidden mb-12 shadow-2xl">
          {/* Category Badge */}
          <div className="mb-6 inline-block bg-slate-700 px-4 py-2 rounded-full">
            <span className="text-2xl">{postCategory.emoji}</span>
            <span className="ml-2 font-semibold">{postCategory.label}</span>
          </div>

          {/* Post Content - Horizontal Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Image - Left */}
            <div className="lg:col-span-1">
              {currentPost.image_url ? (
                <div className="rounded-lg overflow-hidden h-64 bg-slate-700">
                  <img
                    src={currentPost.image_url}
                    alt={currentPost.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 items-center justify-center">
                    <span className="text-5xl">📸</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg h-64 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <span className="text-5xl">📸</span>
                </div>
              )}
            </div>

            {/* Text & Summary - Right */}
            <div className="lg:col-span-2 flex flex-col justify-between min-h-64">
              {currentPost.title && (
                <h2 className="text-3xl font-bold mb-4">{cleanContent(currentPost.title)}</h2>
              )}

              <p className="text-slate-300 text-lg leading-relaxed mb-6">
                {truncateText(cleanContent(currentPost.content), 200)}
              </p>

              {/* AI Summary */}
              {summaryLoading ? (
                <div className="mb-6 p-4 bg-slate-700 rounded-lg text-sm text-slate-300 italic">
                  🤖 Generating summary...
                </div>
              ) : summary ? (
                <div className="mb-6 p-4 bg-slate-700 rounded-lg border border-slate-600">
                  <p className="text-slate-200 leading-relaxed">
                    <span className="font-semibold text-blue-400">✨ Summary:</span> {summary}
                  </p>
                </div>
              ) : null}

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-700">
                <div className="text-xs text-slate-400">
                  {new Date(currentPost.posted_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>

                <a
                  href="https://t.me/mentoria_updates"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Read in Telegram →
                </a>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-full transition-all hover:scale-110 z-10"
            aria-label="Previous post"
          >
            ←
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-full transition-all hover:scale-110 z-10"
            aria-label="Next post"
          >
            →
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mb-12 flex-wrap">
          {posts.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-blue-600 w-8 h-2'
                  : 'bg-slate-600 w-2 h-2 hover:bg-slate-500'
              }`}
              aria-label={`Go to post ${index + 1}`}
            />
          ))}
        </div>

        {/* Subscribe CTA */}
        <div className="text-center">
          <a
            href="https://t.me/mentoria_updates"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Subscribe to @mentoria_updates
            <span>→</span>
          </a>
        </div>
      </div>
    </div>
  );
}
