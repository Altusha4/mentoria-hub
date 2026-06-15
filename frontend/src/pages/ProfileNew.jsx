import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const AVATAR_EMOJIS = ['👤', '😊', '🎓', '🚀', '⭐', '💼', '🎯', '🌟', '💡', '🏆', '🎨', '🧠'];

const INTERESTS_LIST = ['STEM', 'Business', 'English', 'Finance', 'Leadership', 'Design'];

export default function ProfileNew({ studentId }) {
  const [student, setStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [savedOpportunities, setSavedOpportunities] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState('👤');

  useEffect(() => {
    fetchData();
  }, [studentId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentData, enrolled, saved] = await Promise.all([
        api.getStudent(studentId),
        api.getEnrolledCourses(studentId),
        api.getSavedOpportunities(studentId),
      ]);

      setStudent(studentData);
      setEnrolledCourses(enrolled);
      setSavedOpportunities(saved);

      // Парсим интересы
      const interests = studentData.interests ? studentData.interests.split(',').map(i => i.trim()) : [];
      setSelectedInterests(interests);
      setSelectedAvatar(studentData.avatar_emoji || '👤');
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interest) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.updateStudent(studentId, {
        interests: selectedInterests.join(', '),
        avatar_emoji: selectedAvatar
      });

      // Update local storage of interests
      sessionStorage.setItem('studentInterests', selectedInterests.join(', '));

      // Update student data
      setStudent(prev => ({
        ...prev,
        interests: selectedInterests.join(', '),
        avatar_emoji: selectedAvatar
      }));

      alert('✅ Profile updated!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('❌ Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin text-4xl">🔄</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="text-8xl flex-shrink-0">{selectedAvatar}</div>

            {/* Basic Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {student.first_name} {student.last_name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{student.email}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {enrolledCourses.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Courses</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {savedOpportunities.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Saved</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {selectedInterests.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Interests</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {[
            { id: 'profile', label: '👤 Profile', icon: '👤' },
            { id: 'interests', label: '⭐ Interests', icon: '⭐' },
            { id: 'courses', label: '📚 My Courses', icon: '📚' },
            { id: 'saved', label: '💾 Saved', icon: '💾' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Personal Information
              </h2>

              {/* Avatar Selection */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Choose Avatar
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {AVATAR_EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setSelectedAvatar(emoji)}
                      className={`text-4xl p-3 rounded-lg transition-all ${
                        selectedAvatar === emoji
                          ? 'bg-blue-200 dark:bg-blue-600 ring-2 ring-blue-600'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={student.first_name}
                    disabled
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={student.last_name}
                    disabled
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={student.email}
                    disabled
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Grade
                  </label>
                  <input
                    type="text"
                    value={`Grade ${student.grade}`}
                    disabled
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                onClick={saveProfile}
                disabled={saving}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
              >
                {saving ? '⏳ Saving...' : '💾 Save'}
              </button>
            </div>
          )}

          {/* Interests Tab */}
          {activeTab === 'interests' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                My Interests
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Choose your interests to receive personalized recommendations
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                {INTERESTS_LIST.map(interest => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`p-4 rounded-lg font-semibold transition-all ${
                      selectedInterests.includes(interest)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>

              {selectedInterests.length > 0 && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                    Selected Interests:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedInterests.map(interest => (
                      <span
                        key={interest}
                        className="px-3 py-1 bg-blue-200 dark:bg-blue-600 text-blue-900 dark:text-blue-100 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={saveProfile}
                disabled={saving}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
              >
                {saving ? '⏳ Saving...' : '💾 Save Interests'}
              </button>
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                My Courses ({enrolledCourses.length})
              </h2>

              {enrolledCourses.length > 0 ? (
                <div className="space-y-4">
                  {enrolledCourses.map(course => (
                    <div
                      key={course.id}
                      className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {course.title}
                        </h3>
                        <span className="text-sm bg-blue-200 dark:bg-blue-600 text-blue-900 dark:text-blue-100 px-3 py-1 rounded-full">
                          {course.progress || 0}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {course.description}
                      </p>
                      <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all"
                          style={{ width: `${course.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                  You haven't enrolled in any courses yet. <a href="/courses" className="text-blue-600 hover:underline">Browse Courses →</a>
                </p>
              )}
            </div>
          )}

          {/* Saved Tab */}
          {activeTab === 'saved' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Saved Opportunities ({savedOpportunities.length})
              </h2>

              {savedOpportunities.length > 0 ? (
                <div className="space-y-4">
                  {savedOpportunities.map(saved => (
                    <div
                      key={saved.id}
                      className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {saved.opportunity.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {saved.opportunity.category} • {saved.opportunity.format}
                          </p>
                        </div>
                        <span className="text-2xl">{saved.opportunity.category === 'олимпиада' ? '🏆' : '🎯'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                  You haven't saved any opportunities yet. <a href="/opportunities" className="text-blue-600 hover:underline">Explore Opportunities →</a>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
