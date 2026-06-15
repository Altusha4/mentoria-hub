import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import MathCaptcha from '../components/MathCaptcha';

export default function Register({ setStudentId }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    grade: '10',
    interests: [],
    subjects: [],
    goals: '',
  });
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const grades = ['8', '9', '10', '11'];
  const interestOptions = ['STEM', 'Business', 'Finance', 'Programming', 'Science', 'Social Impact', 'English'];
  const subjectOptions = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Economics', 'Computer Science'];

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.email || !formData.first_name || !formData.last_name) {
        setError('Please fill in all personal information');
        return;
      }
    } else if (currentStep === 2) {
      if (formData.interests.length === 0) {
        setError('Please select at least one interest');
        return;
      }
    }
    setError('');
    setCurrentStep(currentStep + 1);
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
    setError('');

    if (!formData.password) {
      setError('Please enter a password');
      return;
    }

    if (!captchaVerified) {
      setError('Please verify the captcha');
      return;
    }

    console.log('📝 [REGISTER] Form submitted');
    console.log(`📝 [REGISTER] Email: ${formData.email}`);
    console.log(`📝 [REGISTER] Name: ${formData.first_name} ${formData.last_name}`);
    console.log(`📝 [REGISTER] Grade: ${formData.grade}`);
    console.log(`📝 [REGISTER] Interests: ${formData.interests.join(',')}`);

    console.log('✅ [REGISTER] Validation passed, sending to API...');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        interests: formData.interests.join(','),
        subjects: formData.subjects.join(','),
      };

      console.log('📤 [REGISTER] Sending payload:', payload);

      const response = await api.register(payload);

      console.log('✅ [REGISTER] Registration successful!');
      console.log('📥 [REGISTER] Response:', response);

      sessionStorage.setItem('accessToken', response.access_token);
      sessionStorage.setItem('studentId', response.student_id);
      sessionStorage.setItem('studentName', response.name);

      console.log('💾 [REGISTER] Saved to sessionStorage');

      setStudentId(response.student_id);

      console.log('✅ [REGISTER] Redirecting to home...');
      navigate('/');
    } catch (err) {
      console.error('❌ [REGISTER] Error caught:', err);
      setError('Failed to create account. Email might already be registered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-2xl p-8">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Mentoria Logo" className="w-12 h-12 mx-auto mb-4 object-contain" />
          <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
          <p className="text-gray-600 mt-2">Join thousands of students learning with Mentoria</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  currentStep >= step
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`w-12 h-1 transition-all ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {currentStep === 1 && 'Personal Information'}
            {currentStep === 2 && 'Your Interests & Goals'}
            {currentStep === 3 && 'Secure Your Account'}
          </h2>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">First Name *</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Grade Level *</label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {grades.map(grade => (
                    <option key={grade} value={grade}>Grade {grade}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Interests */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">What interests you? *</h3>
                <div className="grid grid-cols-2 gap-2">
                  {interestOptions.map(interest => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleInterestToggle(interest)}
                      className={`p-3 border-2 rounded-lg font-semibold transition-all text-sm ${
                        formData.interests.includes(interest)
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Your Subjects</h3>
                <div className="grid grid-cols-2 gap-2">
                  {subjectOptions.map(subject => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => handleSubjectToggle(subject)}
                      className={`p-3 border-2 rounded-lg font-semibold transition-all text-sm ${
                        formData.subjects.includes(subject)
                          ? 'border-green-600 bg-green-50 text-green-600'
                          : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                      }`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Your Goals</label>
                <textarea
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="E.g., Get into a top university, learn programming, win a competition..."
                />
              </div>
            </div>
          )}

          {/* Step 3: Security */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters recommended</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <MathCaptcha onVerify={setCaptchaVerified} />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-6 justify-center items-center">
            <button
              type="button"
              onClick={prevStep}
              className={`px-6 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 ${
                currentStep === 1 ? 'invisible' : ''
              }`}
            >
              ← Back
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 min-w-32"
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || !captchaVerified}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-40"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            )}
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-gray-600 text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
