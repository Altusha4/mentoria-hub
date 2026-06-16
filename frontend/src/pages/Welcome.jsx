import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Welcome() {
  const [dialogIndex, setDialogIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showMascot, setShowMascot] = useState(false);
  const [mascotState, setMascotState] = useState('hello');

  // Диалоги с маскотом
  const dialogs = [
    {
      mascot: 'hello',
      text: 'Hi! I\'m the Mentoria Hub star. Welcome to our platform!'
    },
    {
      mascot: 'idea',
      text: 'Here you\'ll find hundreds of opportunities: olympiads, hackathons, internships, and scholarships.'
    },
    {
      mascot: 'hello',
      text: 'You can take courses and develop your skills in the areas that interest you.'
    },
    {
      mascot: 'thinking',
      text: 'The coolest part - our smart system will recommend programs that perfectly match your profile.'
    },
    {
      mascot: 'idea',
      text: 'We also have special analytics that show you the exact percentage of your chances of success in each program.'
    },
    {
      mascot: 'clap',
      text: 'Don\'t be afraid! Everything will work out. You\'re ready for new challenges, you just need the right platform to find your way.'
    },
    {
      mascot: 'hello',
      text: 'Let\'s start your path to success right now!'
    }
  ];

  const currentDialog = dialogs[dialogIndex];

  // Typewriter эффект
  useEffect(() => {
    if (!isTyping || displayedText.length === currentDialog.text.length) {
      setIsTyping(false);
      return;
    }

    const timer = setTimeout(() => {
      setDisplayedText(currentDialog.text.slice(0, displayedText.length + 1));
    }, 30);

    return () => clearTimeout(timer);
  }, [displayedText, isTyping, currentDialog.text]);

  // Смена диалога
  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    setMascotState(currentDialog.mascot);
    setShowMascot(true);
  }, [dialogIndex, currentDialog.mascot]);

  const handleNext = () => {
    if (isTyping) {
      // Если текст еще печатается - показать весь текст
      setDisplayedText(currentDialog.text);
      setIsTyping(false);
    } else {
      // Если текст полностью показан - перейти дальше
      if (dialogIndex < dialogs.length - 1) {
        setDialogIndex(dialogIndex + 1);
      }
    }
  };

  const getMascotImage = () => {
    const images = {
      hello: '/star_hello.png',
      idea: '/star_idea.png',
      clap: '/star_clap.png',
      thinking: '/star_thinking.png'
    };
    return images[mascotState] || images.hello;
  };

  const isFinished = dialogIndex === dialogs.length - 1 && !isTyping;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center overflow-hidden p-4 relative" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #001a35 50%, #0f1f2e 100%)' }}>
      {/* SVG Animated Background */}
      <svg className="absolute inset-0 w-full h-full" style={{ mixBlendMode: 'screen' }}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3cc5e0" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#20c0a0" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#2195c4" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        {/* Animated constellation lines */}
        <circle cx="20%" cy="30%" r="80" fill="none" stroke="url(#grad1)" strokeWidth="2" opacity="0.3" className="animate-pulseGlow" />
        <circle cx="80%" cy="70%" r="120" fill="none" stroke="url(#grad1)" strokeWidth="2" opacity="0.2" className="animate-pulseGlow" style={{ animationDelay: '1s' }} />
        <circle cx="50%" cy="50%" r="100" fill="none" stroke="url(#grad1)" strokeWidth="1.5" opacity="0.15" className="animate-pulseGlow" style={{ animationDelay: '2s' }} />
      </svg>

      {/* Animated background gradient */}
      <div className="absolute inset-0 animate-gradientShift opacity-90" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #001a35 50%, #0f1f2e 100%)', backgroundSize: '200% 200%' }}></div>

      {/* Фоновые декоративные элементы с улучшенными анимациями */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-floatSlow animate-morphScale" style={{ background: '#3cc5e0' }}></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-floatMedium animate-morphScale" style={{ background: '#20c0a0', animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-floatFast animate-morphScale" style={{ background: '#2195c4', animationDelay: '4s' }}></div>

      {/* Extra floating orbs for depth */}
      <div className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-floatSlow animate-morphScale" style={{ background: '#30d9b8', animationDelay: '1s' }}></div>
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-floatMedium animate-morphScale" style={{ background: '#2eb3d0', animationDelay: '3s' }}></div>

      {/* Additional cosmic particles */}
      <div className="absolute top-1/3 left-1/4 w-48 h-48 rounded-full filter blur-2xl opacity-20 animate-floatFast" style={{ background: '#3cc5e0', animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-1/3 right-1/3 w-64 h-64 rounded-full filter blur-3xl opacity-15 animate-floatSlow" style={{ background: '#1db896', animationDelay: '2.5s' }}></div>

      {/* Контент */}
      <div className="relative z-10 max-w-5xl w-full min-h-screen flex flex-col justify-center">
        <div className="flex items-center gap-3 md:gap-4 lg:gap-6">
          {/* Маскот - слева */}
          <div className="hidden md:flex justify-center items-center flex-shrink-0 w-80 lg:w-96 relative">
            {showMascot && (
              <img
                src={getMascotImage()}
                alt="Mentoria Star"
                className="w-full drop-shadow-2xl animate-mascotBounce animate-mascotGlow"
                style={{ filter: 'drop-shadow(0 0 30px rgba(60, 197, 224, 0.8)) drop-shadow(0 0 50px rgba(32, 192, 160, 0.4))' }}
              />
            )}
          </div>

          {/* Диалоговое окно - справа */}
          <div className="flex-1 w-full animate-slideInRight">
            {/* Логотип */}
            <div className="mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                Mentoria Hub
              </h1>
              <p className="text-blue-100 text-sm md:text-base">Your path to success</p>
            </div>

            {/* Диалоговое окно */}
            <div className="relative bg-white bg-opacity-95 backdrop-blur-md rounded-3xl shadow-xl p-10 md:p-12 border border-white border-opacity-30 overflow-hidden">
              {/* Текст диалога с typewriter эффектом */}
              <div className="min-h-40 mb-8">
                <p className="text-2xl md:text-3xl text-gray-800 font-medium leading-relaxed">
                  {displayedText}
                  {isTyping && <span className="animate-pulse">|</span>}
                </p>
              </div>

              {/* Прогресс диалога */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex gap-2">
                  {dialogs.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-3 rounded-full transition-all duration-500 ${
                        idx <= dialogIndex ? 'w-5 shadow-lg' : 'bg-gradient-to-r from-gray-300 to-gray-200 w-3'
                      }`}
                      style={{
                        background: idx <= dialogIndex ? 'linear-gradient(135deg, #3cc5e0, #20c0a0)' : undefined,
                        boxShadow: idx <= dialogIndex ? '0 0 15px rgba(60, 197, 224, 0.6)' : undefined
                      }}
                    ></div>
                  ))}
                </div>
                <span className="text-sm md:text-base text-gray-500 font-semibold">
                  {dialogIndex + 1} / {dialogs.length}
                </span>
              </div>

              {/* Кнопки */}
              {!isFinished ? (
                <button
                  onClick={handleNext}
                  className="w-full py-4 text-white font-bold rounded-xl hover:opacity-90 transition-all text-base md:text-lg"
                  style={{
                    background: 'linear-gradient(135deg, #3cc5e0, #20c0a0)'
                  }}
                >
                  {isTyping ? 'Show all text' : 'Next →'}
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="w-full py-4 text-white font-bold rounded-xl text-lg md:text-xl text-center" style={{ background: 'linear-gradient(135deg, #3cc5e0, #2195c4)' }}>
                    Ready to start?
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Link
                      to="/register"
                      className="py-4 text-white font-bold rounded-xl hover:opacity-90 transition-all text-center text-base md:text-lg"
                      style={{
                        background: 'linear-gradient(135deg, #3cc5e0, #2195c4)'
                      }}
                    >
                      Sign Up
                    </Link>
                    <Link
                      to="/login"
                      className="py-4 text-white font-bold rounded-xl hover:opacity-90 transition-all text-center text-base md:text-lg"
                      style={{
                        background: 'linear-gradient(135deg, #20c0a0, #1db896)'
                      }}
                    >
                      Log In
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Мобильный маскот - над диалогом */}
            <div className="md:hidden flex justify-center mb-8">
              {showMascot && (
                <img
                  src={getMascotImage()}
                  alt="Mentoria Star"
                  className="w-48 drop-shadow-2xl animate-fadeInScale"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes mascotBounce {
          0%, 100% {
            transform: translateY(0) scale(1) rotateZ(0deg);
          }
          25% {
            transform: translateY(-20px) scale(1.03) rotateZ(2deg);
          }
          50% {
            transform: translateY(-30px) scale(1.05) rotateZ(0deg);
          }
          75% {
            transform: translateY(-12px) scale(1.03) rotateZ(-2deg);
          }
        }

        @keyframes mascotGlow {
          0%, 100% {
            filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.4));
          }
          50% {
            filter: drop-shadow(0 0 35px rgba(139, 92, 246, 0.7));
          }
        }

        @keyframes expandPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.1;
          }
        }

        @keyframes auraRotate {
          0% {
            transform: rotate(0deg) scale(1);
            opacity: 0;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            transform: rotate(360deg) scale(1.1);
            opacity: 0;
          }
        }

        @keyframes floatSlow {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(40px, -40px) rotate(120deg);
          }
          66% {
            transform: translate(-30px, 30px) rotate(240deg);
          }
        }

        @keyframes floatMedium {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(-50px, 50px) rotate(120deg);
          }
          66% {
            transform: translate(50px, -40px) rotate(240deg);
          }
        }

        @keyframes floatFast {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(45px, 45px) rotate(120deg);
          }
          66% {
            transform: translate(-45px, -45px) rotate(240deg);
          }
        }

        @keyframes morphScale {
          0%, 100% {
            transform: scale(1) skewY(0deg);
          }
          25% {
            transform: scale(1.05) skewY(2deg);
          }
          50% {
            transform: scale(0.95) skewY(-2deg);
          }
          75% {
            transform: scale(1.02) skewY(1deg);
          }
        }

        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes borderWave {
          0%, 100% {
            clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
          }
          25% {
            clip-path: polygon(2% 2%, 98% 1%, 99% 98%, 1% 99%);
          }
          50% {
            clip-path: polygon(1% 1%, 99% 2%, 98% 99%, 2% 98%);
          }
          75% {
            clip-path: polygon(2% 1%, 99% 2%, 98% 98%, 1% 99%);
          }
        }

        @keyframes shimmerWave {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes dialogPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.01);
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            opacity: 0.2;
            r: 80px;
          }
          50% {
            opacity: 0.4;
            r: 100px;
          }
        }

        .animate-slideInRight {
          animation: slideInRight 0.6s ease-out;
        }

        .animate-fadeInScale {
          animation: fadeInScale 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-mascotBounce {
          animation: mascotBounce 4.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
        }

        .animate-mascotGlow {
          animation: mascotGlow 3s ease-in-out infinite;
        }

        .animate-expandPulse {
          animation: expandPulse 3s ease-out infinite;
        }

        .animate-auraRotate {
          animation: auraRotate 6s linear infinite;
        }

        .animate-floatSlow {
          animation: floatSlow 22s ease-in-out infinite;
        }

        .animate-floatMedium {
          animation: floatMedium 28s ease-in-out infinite;
        }

        .animate-floatFast {
          animation: floatFast 18s ease-in-out infinite;
        }

        .animate-morphScale {
          animation: morphScale 8s ease-in-out infinite;
        }

        .animate-gradientShift {
          animation: gradientShift 8s ease infinite;
          background-size: 200% 200%;
        }

        .animate-borderWave {
          animation: borderWave 3s ease-in-out infinite;
        }

        .animate-shimmerWave {
          animation: shimmerWave 2s ease-in-out infinite;
        }

        .animate-dialogPulse {
          animation: dialogPulse 4s ease-in-out infinite;
        }

        .animate-pulseGlow {
          animation: pulseGlow 3s ease-in-out infinite;
        }

        .perspective {
          perspective: 1200px;
        }
      `}</style>
    </div>
  );
}
