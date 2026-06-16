import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Welcome() {
  const [showMascot, setShowMascot] = useState(false);
  const [mascotState, setMascotState] = useState('hello');
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    // Показываем маскота через 300ms
    setTimeout(() => setShowMascot(true), 300);

    // Меняем выражение маскота каждые 4 секунды
    const mascotInterval = setInterval(() => {
      setMascotState(prev => {
        const states = ['hello', 'idea', 'clap', 'thinking'];
        const currentIndex = states.indexOf(prev);
        return states[(currentIndex + 1) % states.length];
      });
    }, 4000);

    return () => clearInterval(mascotInterval);
  }, []);

  const motivationalTexts = [
    "Все получится! 🚀",
    "Ты готов к новым вызовам? 💪",
    "Вместе мы достигнем вершин! 🏔️",
    "Твоя история успеха начинается сейчас! ✨",
    "Будь смелым, будь собой, будь лучшим! 🌟"
  ];

  useEffect(() => {
    const textInterval = setInterval(() => {
      setTextIndex(prev => (prev + 1) % motivationalTexts.length);
    }, 5000);

    return () => clearInterval(textInterval);
  }, []);

  const getMascotImage = () => {
    const images = {
      hello: '/star_hello.png',
      idea: '/star_idea.png',
      clap: '/star_clap.png',
      thinking: '/star_thinking.png'
    };
    return images[mascotState] || images.hello;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900 flex items-center justify-center overflow-hidden">
      {/* Фоновые декоративные элементы */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>

      {/* Контент */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Левая часть - Маскот */}
          <div className="flex justify-center items-center order-2 lg:order-1">
            {showMascot && (
              <div className="animate-fadeInScale">
                <img
                  src={getMascotImage()}
                  alt="Mentoria Star Mascot"
                  className="w-64 h-64 md:w-80 md:h-80 drop-shadow-2xl transition-all duration-500 transform hover:scale-105"
                />
              </div>
            )}
          </div>

          {/* Правая часть - Текст и кнопки */}
          <div className="order-1 lg:order-2 text-white">
            {/* Logo/Название */}
            <div className="mb-8 animate-fadeInDown">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-5xl">⭐</span>
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                  Mentoria Hub
                </h1>
              </div>
              <p className="text-xl text-blue-100">Твой путь к успеху начинается здесь</p>
            </div>

            {/* Описание */}
            <div className="space-y-4 mb-8 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <p className="text-lg text-blue-50 leading-relaxed">
                Добро пожаловать в <span className="font-bold">Mentoria Hub</span> — платформу, где мечты становятся реальностью! 🚀
              </p>

              <p className="text-lg text-blue-50 leading-relaxed">
                Здесь ты найдешь:
              </p>

              <ul className="space-y-3 ml-4">
                <li className="flex items-start gap-3 text-blue-50">
                  <span className="text-2xl">🎯</span>
                  <span>Сотни возможностей: олимпиады, хакатоны, стажировки, стипендии</span>
                </li>
                <li className="flex items-start gap-3 text-blue-50">
                  <span className="text-2xl">📚</span>
                  <span>Курсы и материалы для развития твоих навыков</span>
                </li>
                <li className="flex items-start gap-3 text-blue-50">
                  <span className="text-2xl">🤖</span>
                  <span>Умная система подбора программ под твой профиль</span>
                </li>
                <li className="flex items-start gap-3 text-blue-50">
                  <span className="text-2xl">✨</span>
                  <span>Подробный анализ твоих шансов на успех</span>
                </li>
              </ul>
            </div>

            {/* Мотивирующий текст */}
            <div className="mb-8 p-6 bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border border-white border-opacity-20 animate-pulse">
              <p className="text-2xl font-bold text-yellow-300 text-center transition-all duration-500">
                {motivationalTexts[textIndex]}
              </p>
            </div>

            {/* Кнопки */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
              <Link
                to="/register"
                className="flex-1 px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-bold rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all text-lg text-center"
              >
                🚀 Начать сейчас
              </Link>

              <Link
                to="/login"
                className="flex-1 px-8 py-4 bg-white bg-opacity-20 text-white font-bold rounded-xl hover:bg-opacity-30 backdrop-blur-md border-2 border-white border-opacity-50 transition-all text-lg text-center"
              >
                👤 Войти
              </Link>
            </div>

            {/* Доп информация */}
            <div className="mt-8 text-center text-blue-100">
              <p className="text-sm">
                Присоединяйся к тысячам студентов, которые уже нашли свой путь к успеху! 🌟
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeInDown {
          animation: fadeInDown 0.6s ease-out;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }

        .animate-fadeInScale {
          animation: fadeInScale 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}
