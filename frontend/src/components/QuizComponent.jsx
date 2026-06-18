import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { showToast } from '../utils/toast';

export default function QuizComponent({ quiz, lesson, onComplete }) {
  const { theme } = useTheme();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  if (!quiz) return null;

  let questions = [];
  try {
    // Quiz comes from API with questions as a JSON string
    const questionsData = typeof quiz.questions === 'string'
      ? JSON.parse(quiz.questions)
      : quiz.questions;
    questions = Array.isArray(questionsData) ? questionsData : [];

    if (!questions.length) {
      console.error('No questions found in quiz:', quiz);
      return null;
    }
  } catch (e) {
    console.error('Error parsing quiz questions:', e, quiz);
    return null;
  }

  const currentQ = questions[currentQuestion];
  const answered = answers[currentQuestion] !== undefined;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleSelectOption = (optionIdx) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: optionIdx
    }));
  };

  const handleNext = () => {
    if (!answered) {
      showToast.error('Please select an answer');
      return;
    }
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateScore();
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correct) correct++;
    });
    const scorePercentage = (correct / questions.length) * 100;
    setScore(scorePercentage);
    setShowResults(true);
    showToast.success(`Quiz completed! Score: ${scorePercentage.toFixed(0)}%`);
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setScore(0);
  };

  // RESULTS VIEW
  if (showResults) {
    const passed = score >= 70;
    return (
      <div className={`w-full max-w-2xl mx-auto p-8 rounded-2xl border-2 ${
        theme === 'dark'
          ? 'bg-[#0d1926] border-white/10'
          : 'bg-white border-gray-200'
      }`}>
        {/* Score Display */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full mb-6 ${
            passed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
          }`}>
            <div className="text-6xl font-bold" style={{ color: passed ? '#10b981' : '#f59e0b' }}>
              {score.toFixed(0)}%
            </div>
          </div>

          <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {passed ? '🎉 Great Job!' : '💪 Keep Going!'}
          </h2>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {passed ? 'You passed the quiz!' : 'Try again to improve your score.'}
          </p>
        </div>

        {/* Answer Review */}
        <div className="mb-8 space-y-4">
          <h3 className={`font-bold text-lg mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Review Your Answers
          </h3>
          {questions.map((q, idx) => {
            const isCorrect = answers[idx] === q.correct;
            return (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2 ${
                  isCorrect
                    ? theme === 'dark'
                      ? 'border-green-500/30 bg-green-500/5'
                      : 'border-green-300 bg-green-50'
                    : theme === 'dark'
                      ? 'border-red-500/30 bg-red-500/5'
                      : 'border-red-300 bg-red-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{isCorrect ? '✅' : '❌'}</span>
                  <div className="flex-1">
                    <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {q.question}
                    </p>
                    <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Your answer: <span className="font-semibold">{q.options[answers[idx]]}</span>
                    </p>
                    {!isCorrect && (
                      <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>
                        Correct answer: <span className="font-semibold">{q.options[q.correct]}</span>
                      </p>
                    )}
                    <p className={`text-sm mt-2 italic ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      💡 {q.explanation}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          {!passed && (
            <button
              onClick={handleRetry}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all"
            >
              🔄 Retry Quiz
            </button>
          )}
          <button
            onClick={onComplete}
            className={`px-8 py-3 font-bold rounded-lg transition-all ${
              passed
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-400 hover:bg-gray-500 text-white'
            }`}
            disabled={!passed}
          >
            {passed ? '✅ Continue to Next Lesson' : 'Complete 70% to Continue'}
          </button>
        </div>
      </div>
    );
  }

  // QUIZ VIEW
  return (
    <div className={`w-full max-w-2xl mx-auto p-8 rounded-2xl border-2 ${
      theme === 'dark'
        ? 'bg-[#0d1926] border-white/10'
        : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {quiz.title || 'Quiz'}
          </h2>
          <span className={`text-lg font-semibold px-4 py-2 rounded-full ${
            theme === 'dark'
              ? 'bg-white/10 text-white'
              : 'bg-gray-200 text-gray-900'
          }`}>
            {currentQuestion + 1}/{questions.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className={`w-full h-2 rounded-full overflow-hidden ${
          theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'
        }`}>
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <p className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {currentQ.question}
        </p>

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectOption(idx)}
              className={`w-full p-4 rounded-lg border-2 text-left font-semibold transition-all ${
                answers[currentQuestion] === idx
                  ? theme === 'dark'
                    ? 'border-blue-500 bg-blue-500/10 text-white'
                    : 'border-blue-500 bg-blue-50 text-gray-900'
                  : theme === 'dark'
                    ? 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                    : 'border-gray-300 bg-gray-50 text-gray-900 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  answers[currentQuestion] === idx
                    ? 'border-blue-500 bg-blue-500'
                    : theme === 'dark'
                      ? 'border-white/30'
                      : 'border-gray-400'
                }`}>
                  {answers[currentQuestion] === idx && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 justify-between">
        <button
          onClick={() => currentQuestion > 0 && setCurrentQuestion(currentQuestion - 1)}
          disabled={currentQuestion === 0}
          className={`px-6 py-3 font-bold rounded-lg transition-all ${
            currentQuestion === 0
              ? 'opacity-50 cursor-not-allowed'
              : theme === 'dark'
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
          }`}
        >
          ← Back
        </button>

        <button
          onClick={handleNext}
          disabled={!answered}
          className={`px-8 py-3 font-bold rounded-lg transition-all ${
            !answered
              ? 'opacity-50 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white'
          }`}
        >
          {currentQuestion === questions.length - 1 ? '✅ Submit' : 'Next →'}
        </button>
      </div>
    </div>
  );
}
