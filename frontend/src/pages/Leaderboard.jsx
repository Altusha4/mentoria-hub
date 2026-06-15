import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function Leaderboard({ studentId }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [studentId]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await api.getLeaderboard();
      setLeaderboard(data);

      // Find current user's rank
      const myRank = data.find(entry => entry.student_id === studentId);
      if (myRank) {
        setUserRank(myRank);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '⭐';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">🏆 Leaderboard</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            See how you rank against other learners
          </p>
        </div>

        {/* Your Rank Card */}
        {userRank && (
          <div className="mb-12 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-2xl p-8 text-white shadow-xl">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-6xl mb-2">🎖️</div>
                <div className="text-3xl font-bold mb-1"># {userRank.rank}</div>
                <p className="text-yellow-100">Your Rank</p>
              </div>
              <div className="border-l border-r border-white border-opacity-30">
                <div className="text-6xl mb-2">📚</div>
                <div className="text-3xl font-bold mb-1">{userRank.enrolled_courses}</div>
                <p className="text-yellow-100">Courses Enrolled</p>
              </div>
              <div>
                <div className="text-6xl mb-2">📈</div>
                <div className="text-3xl font-bold mb-1">{userRank.average_progress}%</div>
                <p className="text-yellow-100">Avg Progress</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 animate-bounce">⏳</div>
            <p className="text-gray-600 text-lg">Loading leaderboard...</p>
          </div>
        )}

        {/* Leaderboard Table */}
        {!loading && leaderboard.length > 0 && (
          <div className="space-y-4">
            {leaderboard.slice(0, 50).map((entry) => (
              <div
                key={entry.student_id}
                className={`group relative rounded-xl p-6 transition-all transform hover:scale-102 ${
                  entry.student_id === studentId
                    ? 'bg-gradient-to-r from-blue-100 dark:from-blue-900 to-indigo-100 dark:to-indigo-900 border-2 border-blue-500 shadow-lg dark:shadow-blue-900/50'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-blue-900/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* Rank & Name */}
                  <div className="flex items-center gap-6 flex-1">
                    <div className="text-5xl font-bold w-16 text-center">
                      {getMedalEmoji(entry.rank)}
                    </div>
                    <div className="flex-1">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        #{entry.rank}
                      </div>
                      <div className="text-lg text-gray-700 dark:text-gray-300">
                        {entry.name}
                        {entry.student_id === studentId && (
                          <span className="ml-3 px-3 py-1 bg-blue-500 dark:bg-blue-600 text-white text-xs font-bold rounded-full">
                            YOU
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden md:flex gap-12">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {entry.enrolled_courses}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Courses</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {entry.average_progress}%
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="hidden sm:block w-32 ml-6">
                    <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all"
                        style={{ width: `${entry.average_progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Mobile Stats */}
                <div className="md:hidden mt-4 flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{entry.enrolled_courses}</div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Courses</p>
                  </div>
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{entry.average_progress}%</div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Progress</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && leaderboard.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-gray-600 text-lg">No students found yet.</p>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '🥇', title: 'Top Performers', desc: 'Best learners on the platform' },
            { icon: '⚡', title: 'Stay Motivated', desc: 'See how others are progressing' },
            { icon: '🎯', title: 'Climb the Ranks', desc: 'Enroll in more courses and improve' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 text-center hover:shadow-lg dark:hover:shadow-blue-900/30 transition-all">
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
