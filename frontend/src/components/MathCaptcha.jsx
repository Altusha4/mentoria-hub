import { useState, useEffect } from 'react';

export default function MathCaptcha({ onVerify }) {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [answer, setAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 50) + 1;
    const n2 = Math.floor(Math.random() * 50) + 1;
    setNum1(n1);
    setNum2(n2);
    setAnswer('');
    setIsCorrect(false);
    onVerify(false);
  };

  const handleVerify = () => {
    const correctAnswer = num1 + num2;
    if (parseInt(answer) === correctAnswer) {
      setIsCorrect(true);
      onVerify(true);
    } else {
      setIsCorrect(false);
      setAnswer('');
      generateCaptcha();
      onVerify(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        Verify you're human: {num1} + {num2} = ?
      </label>
      <div className="flex gap-2">
        <input
          type="number"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyPress={handleKeyPress}
          className={`flex-1 px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors ${
            isCorrect
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 focus:border-blue-500'
          }`}
          placeholder="Your answer"
          disabled={isCorrect}
        />
        <button
          onClick={handleVerify}
          disabled={!answer || isCorrect}
          className={`px-4 py-2 font-semibold rounded-lg transition-colors ${
            isCorrect
              ? 'bg-green-600 text-white cursor-default'
              : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          {isCorrect ? '✓ Verified' : 'Verify'}
        </button>
      </div>
    </div>
  );
}
