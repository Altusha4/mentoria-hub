import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import MathCaptcha from '../components/MathCaptcha';
import { showToast } from '../utils/toast';

export default function Register({ setStudentId }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Personal
    email: '',
    first_name: '',
    last_name: '',
    grade: '10',
    bio: '',
    // Step 2: Academic Interest
    interests: [],
    subjects: [],
    goals: '',
    // Step 3: Background
    gpa: '',
    ielts_score: '',
    toefl_score: '',
    sat_score: '',
    activities: '',
    certificates: '',
    skills: '',
    // Step 4: Documents & Security
    cv_text: '',
    motivation_letter: '',
    password: '',
  });
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const grades = ['8', '9', '10', '11'];
  const interestOptions = ['STEM', 'Business', 'Finance', 'Programming', 'Science', 'Social Impact', 'English'];
  const subjectOptions = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Economics', 'Computer Science'];

  const validateStep = (step) => {
    if (step === 1) {
      if (!formData.email || !formData.first_name || !formData.last_name) {
        setError('Please fill in all required fields');
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Please enter a valid email');
        return false;
      }
    } else if (step === 2) {
      if (formData.interests.length === 0) {
        setError('Please select at least one interest');
        return false;
      }
    } else if (step === 4) {
      if (!formData.password) {
        setError('Please enter a password');
        return false;
      }
      if (!captchaVerified) {
        setError('Please verify the captcha');
        return false;
      }
    }
    setError('');
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setError('');
    setCurrentStep(currentStep - 1);
  };

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubjectToggle = (subject) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(4)) {
      showToast.error(error || 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    const loadingToast = showToast.loading('Creating your account...');

    try {
      const payload = {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
        grade: parseInt(formData.grade),
        bio: formData.bio || '',
        interests: formData.interests.join(','),
        subjects: formData.subjects.join(','),
        goals: formData.goals || '',
        gpa: formData.gpa ? parseFloat(formData.gpa) : null,
        ielts_score: formData.ielts_score ? parseFloat(formData.ielts_score) : null,
        toefl_score: formData.toefl_score ? parseInt(formData.toefl_score) : null,
        sat_score: formData.sat_score ? parseInt(formData.sat_score) : null,
        activities: formData.activities || '',
        certificates: formData.certificates || '',
        skills: formData.skills || '',
        cv_text: formData.cv_text || '',
        motivation_letter: formData.motivation_letter || '',
      };

      const response = await api.register(payload);

      sessionStorage.setItem('accessToken', response.access_token);
      sessionStorage.setItem('studentId', response.student_id);
      sessionStorage.setItem('studentName', response.name);
      sessionStorage.setItem('avatarEmoji', response.avatar_emoji);
      sessionStorage.setItem('studentInterests', formData.interests.join(', '));

      setStudentId(response.student_id);

      showToast.dismiss(loadingToast);
      showToast.success(`Welcome, ${response.name}! 🎉`);

      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      showToast.dismiss(loadingToast);
      const errorMsg = err.message || 'Failed to create account. Email might already be registered.';
      showToast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, label: 'Personal', icon: '👤' },
    { number: 2, label: 'Interests', icon: '⭐' },
    { number: 3, label: 'Background', icon: '🎓' },
    { number: 4, label: 'Secure', icon: '🔐' },
  ];

  return (
    <div className="min-h-screen py-12 px-4 flex items-center justify-center" style={{
      background: 'linear-gradient(to bottom right, #0a1628, #2195c4, #20c0a0)'
    }}>
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8 text-white">
          <img src="/logo.png" alt="Mentoria" className="w-16 h-16 mx-auto mb-4 object-contain" />
          <h1 className="text-4xl font-bold mb-2">Join Mentoria Hub</h1>
          <p style={{ color: '#b0e0f0' }}>Create your account in just 4 steps</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all mb-2 ${
                    currentStep >= step.number
                      ? 'bg-white shadow-lg'
                      : 'bg-white bg-opacity-30 text-white'
                  }`}
                  style={currentStep >= step.number ? { color: '#2195c4' } : {}}
                >
                  {step.icon}
                </div>
                <span className="text-sm font-semibold" style={{ color: currentStep >= step.number ? 'white' : '#b0e0f0' }}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
          {/* Progress Bar */}
          <div className="h-1 bg-white bg-opacity-20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="text-red-700 font-semibold text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none transition-colors"
                      style={{ focus: 'none' }}
                      onFocus={(e) => e.target.style.borderColor = '#2195c4'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name *</label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none transition-colors"
                      style={{ focus: 'none' }}
                      onFocus={(e) => e.target.style.borderColor = '#2195c4'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none transition-colors"
                    style={{ focus: 'none' }}
                    onFocus={(e) => e.target.style.borderColor = '#2195c4'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Grade Level *</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none transition-colors"
                    style={{ focus: 'none' }}
                    onFocus={(e) => e.target.style.borderColor = '#2195c4'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  >
                    {grades.map(grade => (
                      <option key={grade} value={grade}>Grade {grade}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">About You (Bio)</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none transition-colors resize-none"
                    style={{ focus: 'none' }}
                    onFocus={(e) => e.target.style.borderColor = '#2195c4'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    rows="3"
                    placeholder="Tell us about yourself, your background, achievements..."
                  />
                </div>
              </div>
            )}

            {/* Step 2: Interests & Goals */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Interests & Goals</h2>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">What interests you? *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {interestOptions.map(interest => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleInterestToggle(interest)}
                        className={`p-3 border-2 rounded-lg font-semibold transition-all ${
                          formData.interests.includes(interest)
                            ? 'bg-blue-50 text-gray-700 hover:border-gray-300'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                        style={formData.interests.includes(interest) ? { borderColor: '#2195c4', backgroundColor: '#e0f2fe', color: '#2195c4' } : {}}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">Your Subjects</label>
                  <div className="grid grid-cols-2 gap-2">
                    {subjectOptions.map(subject => (
                      <button
                        key={subject}
                        type="button"
                        onClick={() => handleSubjectToggle(subject)}
                        className={`p-3 border-2 rounded-lg font-semibold transition-all ${
                          formData.subjects.includes(subject)
                            ? 'bg-green-50 text-gray-700 hover:border-gray-300'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                        style={formData.subjects.includes(subject) ? { borderColor: '#20c0a0', backgroundColor: '#e0f7f3', color: '#20c0a0' } : {}}
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your Goals & Ambitions</label>
                  <textarea
                    value={formData.goals}
                    onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none transition-colors resize-none"
                    style={{ focus: 'none' }}
                    onFocus={(e) => e.target.style.borderColor = '#2195c4'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    rows="3"
                    placeholder="E.g., Get into top university, learn programming, win competitions..."
                  />
                </div>
              </div>
            )}

            {/* Step 3: Background & Academic Stats */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Background</h2>
                </div>

                <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: '#e0f2fe' }}>
                  <p className="text-sm text-gray-600">📊 <span className="font-semibold">Optional:</span> Share your academic achievements to get better opportunities</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">GPA</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.1"
                        value={formData.gpa}
                        onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none"
                        style={{ focus: 'none' }}
                        onFocus={(e) => e.target.style.borderColor = '#2195c4'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        placeholder="3.8"
                      />
                      <span className="px-3 py-3 text-gray-600 font-semibold">/4.0</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">IELTS Score</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.1"
                        value={formData.ielts_score}
                        onChange={(e) => setFormData({ ...formData, ielts_score: e.target.value })}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none"
                        style={{ focus: 'none' }}
                        onFocus={(e) => e.target.style.borderColor = '#2195c4'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        placeholder="7.5"
                      />
                      <span className="px-3 py-3 text-gray-600 font-semibold">/9.0</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">TOEFL Score</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={formData.toefl_score}
                        onChange={(e) => setFormData({ ...formData, toefl_score: e.target.value })}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none"
                        style={{ focus: 'none' }}
                        onFocus={(e) => e.target.style.borderColor = '#2195c4'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        placeholder="105"
                      />
                      <span className="px-3 py-3 text-gray-600 font-semibold">/120</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">SAT Score</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={formData.sat_score}
                        onChange={(e) => setFormData({ ...formData, sat_score: e.target.value })}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none"
                        style={{ focus: 'none' }}
                        onFocus={(e) => e.target.style.borderColor = '#2195c4'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        placeholder="1450"
                      />
                      <span className="px-3 py-3 text-gray-600 font-semibold">/1600</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sports & Activities</label>
                  <textarea
                    value={formData.activities}
                    onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none transition-colors resize-none"
                    style={{ focus: 'none' }}
                    onFocus={(e) => e.target.style.borderColor = '#2195c4'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    rows="2"
                    placeholder="E.g., Football (3 years), Volleyball club, Student council..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Certificates & Awards</label>
                  <textarea
                    value={formData.certificates}
                    onChange={(e) => setFormData({ ...formData, certificates: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none transition-colors resize-none"
                    style={{ focus: 'none' }}
                    onFocus={(e) => e.target.style.borderColor = '#2195c4'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    rows="2"
                    placeholder="E.g., Math Olympiad (1st), Cambridge English, Science Fair..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Skills</label>
                  <textarea
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none transition-colors resize-none"
                    style={{ focus: 'none' }}
                    onFocus={(e) => e.target.style.borderColor = '#2195c4'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    rows="2"
                    placeholder="E.g., Python, Leadership, Data Analysis, Problem Solving (comma-separated)"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Documents & Security */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Documents & Security</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Motivation Letter</label>
                    <textarea
                      value={formData.motivation_letter}
                      onChange={(e) => setFormData({ ...formData, motivation_letter: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none transition-colors resize-none"
                      style={{ focus: 'none' }}
                      onFocus={(e) => e.target.style.borderColor = '#2195c4'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      rows="3"
                      placeholder="Share your goals and why you want to join Mentoria..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">CV (Text)</label>
                    <textarea
                      value={formData.cv_text}
                      onChange={(e) => setFormData({ ...formData, cv_text: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none transition-colors resize-none font-mono text-sm"
                      style={{ focus: 'none' }}
                      onFocus={(e) => e.target.style.borderColor = '#2195c4'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      rows="3"
                      placeholder="Your CV in text format..."
                    />
                  </div>

                </div>

                <div className="border-t-2 border-gray-200 pt-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none"
                      style={{ focus: 'none' }}
                      onFocus={(e) => e.target.style.borderColor = '#2195c4'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      placeholder="••••••••"
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum 6 characters recommended</p>
                  </div>

                  <div className="p-4 rounded-lg mt-4" style={{ backgroundColor: '#e0f2fe' }}>
                    <MathCaptcha onVerify={setCaptchaVerified} />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-8 justify-between">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-8 py-3 font-semibold rounded-lg border-2 transition-all ${
                  currentStep === 1
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                ← Back
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-all"
                  style={{ backgroundColor: '#2195c4' }}
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !captchaVerified}
                  className="px-8 py-3 text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  style={{ backgroundColor: '#20c0a0' }}
                >
                  {loading ? 'Creating account...' : '✅ Create Account'}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Sign In Link */}
        <div className="text-center text-white">
          <p className="text-sm">
            Already have an account?{' '}
            <Link to="/login" className="font-bold underline hover:opacity-80">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
