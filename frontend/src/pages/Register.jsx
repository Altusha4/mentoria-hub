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

  // ── shared styles ──
  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const inputFocus = (e) => {
    e.target.style.borderColor = '#3cc5e0';
    e.target.style.boxShadow = '0 0 0 3px rgba(60,197,224,0.25)';
  };

  const inputBlur = (e) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.15)';
    e.target.style.boxShadow = 'none';
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '8px',
    letterSpacing: '0.3px',
  };

  return (
    <div style={{
      minHeight: '100vh',
      padding: '40px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #060d18 0%, #0a1628 40%, #0f2a3d 70%, #0a1628 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{
        position: 'absolute', top: '-120px', left: '-80px',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(60,197,224,0.12) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none',
      }} className="mentoria-orbFloat" />
      <div style={{
        position: 'absolute', bottom: '-100px', right: '-60px',
        width: '350px', height: '350px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(32,192,160,0.10) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none',
      }} className="mentoria-orbFloat" />

      <div style={{ width: '100%', maxWidth: '640px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }} className="mentoria-fadeInUp">
          <img src="/logo.png" alt="Mentoria" style={{
            width: '56px', height: '56px', objectFit: 'contain', margin: '0 auto 16px',
            filter: 'drop-shadow(0 0 20px rgba(60,197,224,0.4))',
          }} />
          <h1 style={{
            fontSize: '32px', fontWeight: 800, color: '#fff', margin: '0 0 8px',
            background: 'linear-gradient(135deg, #fff 0%, #3cc5e0 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Join Mentoria Hub
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', margin: 0 }}>
            Create your account in just 4 steps
          </p>
        </div>

        {/* Progress Indicator */}
        <div style={{ marginBottom: '32px' }} className="mentoria-fadeInUp mentoria-delay-1">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            {steps.map((step, idx) => (
              <div key={step.number} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
                {/* Connector line */}
                {idx < steps.length - 1 && (
                  <div style={{
                    position: 'absolute', top: '22px', left: '55%', width: '90%', height: '2px',
                    background: currentStep > step.number
                      ? 'linear-gradient(90deg, #3cc5e0, #20c0a0)'
                      : 'rgba(255,255,255,0.1)',
                    transition: 'background 0.3s',
                  }} />
                )}
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', fontWeight: 700, marginBottom: '8px',
                  background: currentStep >= step.number
                    ? 'linear-gradient(135deg, #3cc5e0, #20c0a0)'
                    : 'rgba(255,255,255,0.08)',
                  border: currentStep >= step.number ? 'none' : '1px solid rgba(255,255,255,0.12)',
                  boxShadow: currentStep >= step.number ? '0 4px 20px rgba(60,197,224,0.3)' : 'none',
                  transition: 'all 0.3s',
                  position: 'relative', zIndex: 1,
                }}>
                  {step.icon}
                </div>
                <span style={{
                  fontSize: '12px', fontWeight: 600,
                  color: currentStep >= step.number ? '#3cc5e0' : 'rgba(255,255,255,0.35)',
                  transition: 'color 0.3s',
                }}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
          {/* Progress Bar */}
          <div style={{
            height: '3px', borderRadius: '4px',
            background: 'rgba(255,255,255,0.08)', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: '4px',
              background: 'linear-gradient(90deg, #3cc5e0, #20c0a0)',
              width: `${(currentStep / 4) * 100}%`,
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        {/* Form Card */}
        <div className="mentoria-fadeInUp mentoria-delay-2" style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          padding: '36px',
          marginBottom: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}>
          {error && (
            <div style={{
              marginBottom: '20px', padding: '14px 18px',
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '12px',
            }}>
              <p style={{ color: '#f87171', fontWeight: 600, fontSize: '14px', margin: 0 }}>⚠️ {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="mentoria-fadeInUp" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
                  Personal Information
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>First Name *</label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      style={inputStyle}
                      onFocus={inputFocus}
                      onBlur={inputBlur}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Last Name *</label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      style={inputStyle}
                      onFocus={inputFocus}
                      onBlur={inputBlur}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Email Address *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={inputStyle}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label style={labelStyle}>Grade Level *</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  >
                    {grades.map(grade => (
                      <option key={grade} value={grade} style={{ background: '#0a1628', color: '#fff' }}>
                        Grade {grade}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>About You (Bio)</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    style={{ ...inputStyle, resize: 'none', minHeight: '80px' }}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                    rows="3"
                    placeholder="Tell us about yourself, your background, achievements..."
                  />
                </div>
              </div>
            )}

            {/* Step 2: Interests & Goals */}
            {currentStep === 2 && (
              <div className="mentoria-fadeInUp" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
                  Your Interests & Goals
                </h2>

                <div>
                  <label style={{ ...labelStyle, marginBottom: '14px' }}>What interests you? *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {interestOptions.map(interest => {
                      const active = formData.interests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => handleInterestToggle(interest)}
                          style={{
                            padding: '12px 16px', borderRadius: '12px', fontWeight: 600,
                            fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
                            border: active ? '1px solid #3cc5e0' : '1px solid rgba(255,255,255,0.12)',
                            background: active ? 'rgba(60,197,224,0.15)' : 'rgba(255,255,255,0.04)',
                            color: active ? '#3cc5e0' : 'rgba(255,255,255,0.7)',
                            boxShadow: active ? '0 0 16px rgba(60,197,224,0.15)' : 'none',
                          }}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label style={{ ...labelStyle, marginBottom: '14px' }}>Your Subjects</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {subjectOptions.map(subject => {
                      const active = formData.subjects.includes(subject);
                      return (
                        <button
                          key={subject}
                          type="button"
                          onClick={() => handleSubjectToggle(subject)}
                          style={{
                            padding: '12px 16px', borderRadius: '12px', fontWeight: 600,
                            fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
                            border: active ? '1px solid #20c0a0' : '1px solid rgba(255,255,255,0.12)',
                            background: active ? 'rgba(32,192,160,0.15)' : 'rgba(255,255,255,0.04)',
                            color: active ? '#20c0a0' : 'rgba(255,255,255,0.7)',
                            boxShadow: active ? '0 0 16px rgba(32,192,160,0.15)' : 'none',
                          }}
                        >
                          {subject}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Your Goals & Ambitions</label>
                  <textarea
                    value={formData.goals}
                    onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                    style={{ ...inputStyle, resize: 'none', minHeight: '80px' }}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                    rows="3"
                    placeholder="E.g., Get into top university, learn programming, win competitions..."
                  />
                </div>
              </div>
            )}

            {/* Step 3: Background & Academic Stats */}
            {currentStep === 3 && (
              <div className="mentoria-fadeInUp" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
                  Your Background
                </h2>

                <div style={{
                  padding: '14px 18px', borderRadius: '12px',
                  background: 'rgba(60,197,224,0.08)',
                  border: '1px solid rgba(60,197,224,0.2)',
                }}>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0 }}>
                    📊 <span style={{ fontWeight: 600, color: '#3cc5e0' }}>Optional:</span> Share your academic achievements to get better opportunities
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>GPA</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.gpa}
                        onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                        style={{ ...inputStyle, flex: 1 }}
                        onFocus={inputFocus}
                        onBlur={inputBlur}
                        placeholder="3.8"
                      />
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, fontSize: '14px' }}>/4.0</span>
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>IELTS Score</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.ielts_score}
                        onChange={(e) => setFormData({ ...formData, ielts_score: e.target.value })}
                        style={{ ...inputStyle, flex: 1 }}
                        onFocus={inputFocus}
                        onBlur={inputBlur}
                        placeholder="7.5"
                      />
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, fontSize: '14px' }}>/9.0</span>
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>TOEFL Score</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="number"
                        value={formData.toefl_score}
                        onChange={(e) => setFormData({ ...formData, toefl_score: e.target.value })}
                        style={{ ...inputStyle, flex: 1 }}
                        onFocus={inputFocus}
                        onBlur={inputBlur}
                        placeholder="105"
                      />
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, fontSize: '14px' }}>/120</span>
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>SAT Score</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="number"
                        value={formData.sat_score}
                        onChange={(e) => setFormData({ ...formData, sat_score: e.target.value })}
                        style={{ ...inputStyle, flex: 1 }}
                        onFocus={inputFocus}
                        onBlur={inputBlur}
                        placeholder="1450"
                      />
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, fontSize: '14px' }}>/1600</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Sports & Activities</label>
                  <textarea
                    value={formData.activities}
                    onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
                    style={{ ...inputStyle, resize: 'none', minHeight: '64px' }}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                    rows="2"
                    placeholder="E.g., Football (3 years), Volleyball club, Student council..."
                  />
                </div>

                <div>
                  <label style={labelStyle}>Certificates & Awards</label>
                  <textarea
                    value={formData.certificates}
                    onChange={(e) => setFormData({ ...formData, certificates: e.target.value })}
                    style={{ ...inputStyle, resize: 'none', minHeight: '64px' }}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                    rows="2"
                    placeholder="E.g., Math Olympiad (1st), Cambridge English, Science Fair..."
                  />
                </div>

                <div>
                  <label style={labelStyle}>Skills</label>
                  <textarea
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    style={{ ...inputStyle, resize: 'none', minHeight: '64px' }}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                    rows="2"
                    placeholder="E.g., Python, Leadership, Data Analysis (comma-separated)"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Documents & Security */}
            {currentStep === 4 && (
              <div className="mentoria-fadeInUp" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
                  Documents & Security
                </h2>

                <div>
                  <label style={labelStyle}>Motivation Letter</label>
                  <textarea
                    value={formData.motivation_letter}
                    onChange={(e) => setFormData({ ...formData, motivation_letter: e.target.value })}
                    style={{ ...inputStyle, resize: 'none', minHeight: '80px' }}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                    rows="3"
                    placeholder="Share your goals and why you want to join Mentoria..."
                  />
                </div>

                <div>
                  <label style={labelStyle}>CV (Text)</label>
                  <textarea
                    value={formData.cv_text}
                    onChange={(e) => setFormData({ ...formData, cv_text: e.target.value })}
                    style={{ ...inputStyle, resize: 'none', minHeight: '80px', fontFamily: 'monospace', fontSize: '13px' }}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                    rows="3"
                    placeholder="Your CV in text format..."
                  />
                </div>

                <div style={{
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  paddingTop: '24px',
                }}>
                  <div>
                    <label style={labelStyle}>Password *</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      style={inputStyle}
                      onFocus={inputFocus}
                      onBlur={inputBlur}
                      placeholder="••••••••"
                    />
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', marginTop: '6px' }}>
                      Minimum 6 characters recommended
                    </p>
                  </div>

                  <div style={{
                    marginTop: '16px', padding: '16px', borderRadius: '12px',
                    background: 'rgba(60,197,224,0.06)',
                    border: '1px solid rgba(60,197,224,0.15)',
                  }}>
                    <MathCaptcha onVerify={setCaptchaVerified} />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div style={{
              display: 'flex', gap: '16px', paddingTop: '32px', justifyContent: 'space-between',
            }}>
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                style={{
                  padding: '12px 28px', fontWeight: 600, borderRadius: '12px',
                  fontSize: '15px', cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'transparent',
                  color: currentStep === 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
                  opacity: currentStep === 1 ? 0.5 : 1,
                }}
              >
                ← Back
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  style={{
                    padding: '12px 32px', fontWeight: 700, borderRadius: '12px',
                    fontSize: '15px', cursor: 'pointer', border: 'none',
                    background: 'linear-gradient(135deg, #3cc5e0, #2195c4)',
                    color: '#fff', transition: 'all 0.2s',
                    boxShadow: '0 4px 20px rgba(60,197,224,0.3)',
                  }}
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !captchaVerified}
                  style={{
                    padding: '12px 32px', fontWeight: 700, borderRadius: '12px',
                    fontSize: '15px', cursor: loading || !captchaVerified ? 'not-allowed' : 'pointer',
                    border: 'none',
                    background: loading || !captchaVerified
                      ? 'rgba(32,192,160,0.3)'
                      : 'linear-gradient(135deg, #20c0a0, #3cc5e0)',
                    color: '#fff', transition: 'all 0.2s',
                    boxShadow: loading || !captchaVerified ? 'none' : '0 4px 20px rgba(32,192,160,0.3)',
                    opacity: loading || !captchaVerified ? 0.6 : 1,
                  }}
                >
                  {loading ? 'Creating account...' : '✅ Create Account'}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Sign In Link */}
        <div style={{ textAlign: 'center' }} className="mentoria-fadeInUp mentoria-delay-3">
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: 0 }}>
            Already have an account?{' '}
            <Link to="/login" style={{
              color: '#3cc5e0', fontWeight: 700, textDecoration: 'none',
              borderBottom: '1px solid transparent',
              transition: 'border-color 0.2s',
            }}
              onMouseEnter={(e) => e.target.style.borderBottomColor = '#3cc5e0'}
              onMouseLeave={(e) => e.target.style.borderBottomColor = 'transparent'}
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
