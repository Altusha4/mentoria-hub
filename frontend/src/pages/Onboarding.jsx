import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

export default function Onboarding({ setStudentId }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    grade: '10',
    interests: [],
    subjects: [],
    goals: '',
  });

  const grades = ['8', '9', '10', '11'];
  const interestOptions = ['STEM', 'Business', 'Finance', 'Programming', 'Science', 'Social Impact', 'English'];
  const subjectOptions = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Economics', 'Computer Science'];

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

  const handleSubmit = async () => {
    if (!formData.email || !formData.first_name || !formData.last_name) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const payload = {
        ...formData,
        interests: formData.interests.join(','),
        subjects: formData.subjects.join(','),
      };

      const response = await api.createStudent(payload);

      // Save to localStorage
      localStorage.setItem('studentId', response.id);
      localStorage.setItem('studentName', `${response.first_name} ${response.last_name}`);
      localStorage.setItem('studentInterests', response.interests);

      // Set state
      setStudentId(response.id);

      // Redirect to home
      navigate('/');
    } catch (error) {
      console.error('Error creating student:', error);
      alert('Failed to create account. Email might already exist.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to Mentoria Hub</h1>
          <p className="text-gray-600">Step {step} of 4 — Let's get to know you</p>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Information</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
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
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">What interests you?</h2>
            <p className="text-gray-600">Select all that apply</p>

            <div className="grid grid-cols-2 gap-3">
              {interestOptions.map(interest => (
                <button
                  key={interest}
                  onClick={() => handleInterestToggle(interest)}
                  className={`p-4 border-2 rounded-lg font-semibold transition-all ${
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
        )}

        {/* Step 3: Subjects */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Subjects</h2>
            <p className="text-gray-600">Select your strongest subjects</p>

            <div className="grid grid-cols-2 gap-3">
              {subjectOptions.map(subject => (
                <button
                  key={subject}
                  onClick={() => handleSubjectToggle(subject)}
                  className={`p-4 border-2 rounded-lg font-semibold transition-all ${
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
        )}

        {/* Step 4: Goals */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Goals</h2>
            <p className="text-gray-600">What do you want to achieve?</p>

            <textarea
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="6"
              placeholder="E.g., Get into a top university, learn programming, win a competition..."
            />
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            ← Back
          </button>

          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${i <= step ? 'bg-blue-600' : 'bg-gray-300'}`}
              />
            ))}
          </div>

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Start Learning!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
