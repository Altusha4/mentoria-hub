import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const CATEGORY_ICONS = {
  hiring: '💼',
  programs: '📚',
  opportunities: '🎯',
  news: '📢',
  tips: '💡',
  general: '⭐'
};

export default function SmartRecommendations({ studentId, studentInterests }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, [studentInterests]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!studentInterests || studentInterests.length === 0) {
        setRecommendations([]);
        return;
      }

      // Парсим интересы студента
      const interests = typeof studentInterests === 'string'
        ? studentInterests.split(',').map(i => i.trim()).filter(Boolean)
        : studentInterests;

      // Получаем рекомендации
      const response = await fetch('http://localhost:8080/api/recommendations/get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interests: interests,
          top_k: 6
        })
      });

      if (!response.ok) throw new Error('Failed to fetch recommendations');
      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || recommendations.length === 0) {
    return null;
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🤖</span>
            <h2 className="text-3xl font-bold text-gray-900">Персональные рекомендации</h2>
          </div>
          <p className="text-gray-600">
            Специально подобрано на основе твоих интересов
          </p>
        </div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec) => (
            <div
              key={rec.post_id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-blue-500"
            >
              {/* Category Badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">
                  {CATEGORY_ICONS[rec.category] || CATEGORY_ICONS.general}
                </span>
                <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {rec.category}
                </span>
                {/* Relevance Score */}
                <span className="text-xs font-semibold text-green-600 ml-auto">
                  {Math.round(rec.score * 100)}% match
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {rec.title}
              </h3>

              {/* Score Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all"
                  style={{ width: `${rec.score * 100}%` }}
                ></div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  Релевантность: {(rec.score * 100).toFixed(0)}%
                </span>
                <a
                  href="https://t.me/mentoria_updates"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Подробнее →
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <a
            href="/updates"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            Смотреть все обновления →
          </a>
        </div>
      </div>
    </section>
  );
}
