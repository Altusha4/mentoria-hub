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
      text: 'Привет! Я звезда Mentoria Hub. Добро пожаловать на нашу платформу!'
    },
    {
      mascot: 'idea',
      text: 'Здесь ты найдешь сотни возможностей: олимпиады, хакатоны, стажировки и стипендии.'
    },
    {
      mascot: 'hello',
      text: 'Ты сможешь пройти курсы и развить свои навыки в интересующих тебя направлениях.'
    },
    {
      mascot: 'thinking',
      text: 'Самое крутое - наша умная система подберет для тебя программы, которые идеально подойдут под твой профиль.'
    },
    {
      mascot: 'idea',
      text: 'А еще у нас есть специальный анализ, который покажет тебе точный процент твоих шансов на успех в каждой программе.'
    },
    {
      mascot: 'clap',
      text: 'Не бойся! Все получится. Ты уже готов к новым вызовам, тебе просто нужна правильная платформа, чтобы найти свой путь.'
    },
    {
      mascot: 'hello',
      text: 'Давай начнем твой путь к успеху прямо сейчас!'
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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900 flex items-center justify-center overflow-hidden p-4">
      {/* Фоновые декоративные элементы */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>

      {/* Контент */}
      <div className="relative z-10 max-w-7xl w-full">
        <div className="flex items-center gap-6 md:gap-8 lg:gap-12">
          {/* Маскот - слева */}
          <div className="hidden md:flex justify-center items-center flex-shrink-0 w-80 lg:w-96">
            {showMascot && (
              <img
                src={getMascotImage()}
                alt="Mentoria Star"
                className="w-full drop-shadow-2xl animate-fadeInScale"
              />
            )}
          </div>

          {/* Диалоговое окно - справа */}
          <div className="flex-1 w-full animate-slideInRight">
            {/* Логотип */}
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Mentoria Hub
              </h1>
              <p className="text-blue-100 text-lg">Твой путь к успеху</p>
            </div>

            {/* Диалоговое окно */}
            <div className="bg-white bg-opacity-95 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-7 border-2 border-white border-opacity-20">
              {/* Текст диалога с typewriter эффектом */}
              <div className="min-h-24 mb-6">
                <p className="text-lg md:text-xl text-gray-800 font-medium leading-relaxed">
                  {displayedText}
                  {isTyping && <span className="animate-pulse">|</span>}
                </p>
              </div>

              {/* Прогресс диалога */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2">
                  {dialogs.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2 rounded-full transition-all ${
                        idx <= dialogIndex ? 'bg-blue-600 w-4' : 'bg-gray-300 w-2'
                      }`}
                    ></div>
                  ))}
                </div>
                <span className="text-xs md:text-sm text-gray-500">
                  {dialogIndex + 1} / {dialogs.length}
                </span>
              </div>

              {/* Кнопки */}
              {!isFinished ? (
                <button
                  onClick={handleNext}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all text-base md:text-lg"
                >
                  {isTyping ? 'Показать весь текст' : 'Дальше →'}
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl text-base md:text-lg text-center">
                    Готов начать?
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/register"
                      className="py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all text-center text-sm md:text-base"
                    >
                      Зарегистрироваться
                    </Link>
                    <Link
                      to="/login"
                      className="py-3 bg-gray-600 text-white font-bold rounded-xl hover:bg-gray-700 transition-all text-center text-sm md:text-base"
                    >
                      Войти
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

        .animate-slideInRight {
          animation: slideInRight 0.6s ease-out;
        }

        .animate-fadeInScale {
          animation: fadeInScale 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}
