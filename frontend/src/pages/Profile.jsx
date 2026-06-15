import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function Profile({ studentId }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (studentId) {
      loadProfile();
    }
  }, [studentId]);

  const loadProfile = async () => {
    try {
      const data = await api.getStudent(studentId);
      setProfile(data);
      setFormData(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.updateStudent(studentId, formData);
      setProfile(formData);
      setEditing(false);
      alert('✅ Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('❌ Failed to save profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">⏳</div>
          <p className="text-gray-700 dark:text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400 text-xl">No profile data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Avatar */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white mb-8 shadow-lg">
          <div className="flex items-center gap-6">
            <div className="text-7xl">{profile.avatar_emoji}</div>
            <div>
              <h1 className="text-4xl font-bold">
                {profile.first_name} {profile.last_name}
              </h1>
              <p className="text-blue-100">Grade {profile.grade}</p>
              <p className="text-blue-100 text-sm mt-2">{profile.email}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto border-b border-gray-200 dark:border-slate-700">
          {[
            { id: 'overview', label: '📊 Overview', icon: '📊' },
            { id: 'academics', label: '🎓 Academic Stats', icon: '🎓' },
            { id: 'activities', label: '⭐ Activities', icon: '⭐' },
            { id: 'documents', label: '📄 Documents', icon: '📄' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Edit Button */}
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="mb-6 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
          >
            ✏️ Edit Profile
          </button>
        )}

        {/* TAB 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">📚 About You</h2>
              {editing ? (
                <textarea
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself, your goals, interests..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                  rows="4"
                />
              ) : (
                <p className="text-gray-700 dark:text-gray-300">{profile.bio || '—'}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Interests */}
              <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-purple-900 dark:text-purple-300 mb-3">💜 Interests</h3>
                <p className="text-gray-700 dark:text-gray-300">{profile.interests || '—'}</p>
              </div>

              {/* Subjects */}
              <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-green-900 dark:text-green-300 mb-3">🎓 Subjects</h3>
                <p className="text-gray-700 dark:text-gray-300">{profile.subjects || '—'}</p>
              </div>

              {/* Goals */}
              <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-xl p-6 md:col-span-2">
                <h3 className="text-lg font-bold text-orange-900 dark:text-orange-300 mb-3">🎯 Goals & Ambitions</h3>
                <p className="text-gray-700 dark:text-gray-300">{profile.goals || '—'}</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Academic Stats */}
        {activeTab === 'academics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: '📊 GPA', key: 'gpa', placeholder: '3.8', suffix: '/4.0' },
              { label: '🎯 IELTS', key: 'ielts_score', placeholder: '7.5', suffix: '/9.0' },
              { label: '🗣️ TOEFL', key: 'toefl_score', placeholder: '105', suffix: '/120' },
              { label: '📝 SAT', key: 'sat_score', placeholder: '1450', suffix: '/1600' },
            ].map((stat) => (
              <div key={stat.key} className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-3">{stat.label}</h3>
                {editing ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={formData[stat.key] || ''}
                      onChange={(e) => setFormData({ ...formData, [stat.key]: e.target.value ? parseFloat(e.target.value) : null })}
                      placeholder={stat.placeholder}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                    />
                    <span className="px-3 py-2 text-gray-700 dark:text-gray-300 font-semibold">{stat.suffix}</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formData[stat.key] !== null && formData[stat.key] !== undefined ? formData[stat.key] : '—'}
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">{stat.suffix}</span>
                  </p>
                )}
              </div>
            ))}

            {/* Transcript */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-6 md:col-span-2">
              <h3 className="text-lg font-bold text-yellow-900 dark:text-yellow-300 mb-3">📋 Transcript/Certificate URL</h3>
              {editing ? (
                <input
                  type="url"
                  value={formData.transcript_url || ''}
                  onChange={(e) => setFormData({ ...formData, transcript_url: e.target.value })}
                  placeholder="https://example.com/transcript"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                />
              ) : (
                <p className="text-gray-700 dark:text-gray-300 break-all">
                  {formData.transcript_url ? (
                    <a href={formData.transcript_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      View Transcript
                    </a>
                  ) : (
                    '—'
                  )}
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Activities */}
        {activeTab === 'activities' && (
          <div className="space-y-6">
            {/* Sports & Activities */}
            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-green-900 dark:text-green-300 mb-3">⚽ Sports & Activities</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">E.g., "Football (3 years), Volleyball club, Student council"</p>
              {editing ? (
                <textarea
                  value={formData.activities || ''}
                  onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
                  placeholder="List your sports, clubs, volunteer work..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                  rows="3"
                />
              ) : (
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{formData.activities || '—'}</p>
              )}
            </div>

            {/* Certificates & Awards */}
            <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-orange-900 dark:text-orange-300 mb-3">🏆 Certificates & Awards</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">E.g., "Math Olympiad (1st place), Cambridge English, Science Fair"</p>
              {editing ? (
                <textarea
                  value={formData.certificates || ''}
                  onChange={(e) => setFormData({ ...formData, certificates: e.target.value })}
                  placeholder="List your awards and certificates..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                  rows="3"
                />
              ) : (
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{formData.certificates || '—'}</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Documents */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            {/* CV Text */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-3">📄 CV (Text)</h3>
              {editing ? (
                <textarea
                  value={formData.cv_text || ''}
                  onChange={(e) => setFormData({ ...formData, cv_text: e.target.value })}
                  placeholder="Your CV in text format..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white font-mono text-sm"
                  rows="6"
                />
              ) : (
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono text-sm">{formData.cv_text || '—'}</p>
              )}
            </div>

            {/* CV Video */}
            <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-purple-900 dark:text-purple-300 mb-3">🎥 CV Video</h3>
              {editing ? (
                <input
                  type="url"
                  value={formData.cv_video_url || ''}
                  onChange={(e) => setFormData({ ...formData, cv_video_url: e.target.value })}
                  placeholder="https://youtube.com/... or https://vimeo.com/..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                />
              ) : (
                <p className="text-gray-700 dark:text-gray-300 break-all">
                  {formData.cv_video_url ? (
                    <a href={formData.cv_video_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Watch CV Video
                    </a>
                  ) : (
                    '—'
                  )}
                </p>
              )}
            </div>

            {/* Motivation Letter */}
            <div className="bg-pink-50 dark:bg-pink-900/20 border-2 border-pink-200 dark:border-pink-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-pink-900 dark:text-pink-300 mb-3">💭 Motivation Letter</h3>
              {editing ? (
                <textarea
                  value={formData.motivation_letter || ''}
                  onChange={(e) => setFormData({ ...formData, motivation_letter: e.target.value })}
                  placeholder="Share why you're passionate about your goals..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                  rows="5"
                />
              ) : (
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{formData.motivation_letter || '—'}</p>
              )}
            </div>
          </div>
        )}

        {/* Save/Cancel Buttons */}
        {editing && (
          <div className="flex gap-3 mt-8 sticky bottom-4">
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
            >
              ✅ Save Changes
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setFormData(profile);
              }}
              className="flex-1 px-6 py-3 bg-gray-400 hover:bg-gray-500 text-white font-bold rounded-lg transition-colors"
            >
              ❌ Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
