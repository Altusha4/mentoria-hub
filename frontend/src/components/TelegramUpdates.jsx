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

const truncateText = (text, limit = 200) => {
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

export default function TelegramUpdates() {
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

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % posts.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length);
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

  if (loading || posts.length === 0) {
    return null;
  }

  const currentPost = posts[currentIndex];
  const postCategory = CATEGORY_LABELS[currentPost.category] || CATEGORY_LABELS.general;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="text-4xl">📢</span>
            <div>
              <h2 className="text-3xl font-bold">Latest Updates</h2>
              <p className="text-blue-100 text-sm">From @mentoria_updates</p>
            </div>
          </div>
          <div className="text-sm text-blue-100">
            {currentIndex + 1} / {posts.length}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-min">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full font-semibold transition-all whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-white text-blue-600'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
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
                    ? 'bg-white text-blue-600'
                    : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                }`}
              >
                <span>{CATEGORY_LABELS[cat.name]?.emoji}</span>
                {CATEGORY_LABELS[cat.name]?.label} ({cat.count})
              </button>
            ))}
          </div>
        </div>

        {/* Carousel */}
        <div className="relative bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 border border-white border-opacity-20 overflow-hidden">
          {/* Category Badge */}
          <div className="mb-4 inline-block bg-white bg-opacity-20 px-4 py-2 rounded-full">
            <span className="text-2xl">{postCategory.emoji}</span>
            <span className="ml-2 font-semibold">{postCategory.label}</span>
          </div>

          {/* Post Content - Horizontal Layout */}
          <div className="grid grid-cols-3 gap-6 items-start min-h-72">
            {/* Image - Left */}
            <div className="col-span-1">
              {currentPost.image_url ? (
                <div className="rounded-lg overflow-hidden h-60 bg-black bg-opacity-20">
                  <img
                    src={currentPost.image_url}
                    alt={currentPost.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden w-full h-full bg-gradient-to-br from-blue-400 to-indigo-600 items-center justify-center">
                    <span className="text-4xl">📸</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg h-60 bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
                  <span className="text-4xl">📸</span>
                </div>
              )}
            </div>

            {/* Text & Summary - Right */}
            <div className="col-span-2 flex flex-col justify-between">
              {currentPost.title && (
                <h3 className="text-2xl font-bold mb-3">{cleanContent(currentPost.title)}</h3>
              )}

              <p className="text-blue-100 text-base leading-relaxed mb-4 opacity-90">
                {truncateText(cleanContent(currentPost.content), 150)}
              </p>

              {/* AI Summary */}
              {summaryLoading ? (
                <div className="mb-4 p-3 bg-white bg-opacity-10 rounded-lg text-sm text-blue-200 italic">
                  🤖 Generating summary...
                </div>
              ) : summary ? (
                <div className="mb-4 p-3 bg-white bg-opacity-15 rounded-lg border border-white border-opacity-20">
                  <p className="text-sm text-blue-50 leading-relaxed">
                    ✨ <span className="font-semibold">Summary:</span> {summary}
                  </p>
                </div>
              ) : null}

              <a
                href="https://t.me/mentoria_updates"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white font-semibold hover:text-blue-100 transition-colors w-fit"
              >
                Узнать больше в Telegram →
              </a>

              {/* Meta Info */}
              <div className="text-xs text-blue-200 pt-3 mt-auto">
                {new Date(currentPost.posted_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all hover:scale-110"
            aria-label="Previous post"
          >
            ←
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all hover:scale-110"
            aria-label="Next post"
          >
            →
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {posts.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white bg-opacity-50 w-2 hover:bg-opacity-75'
              }`}
              aria-label={`Go to post ${index + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
