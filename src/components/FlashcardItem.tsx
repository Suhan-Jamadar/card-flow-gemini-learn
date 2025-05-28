
import React, { useState } from 'react';

interface FlashcardItemProps {
  question: string;
  answer: string;
  index: number;
}

export const FlashcardItem: React.FC<FlashcardItemProps> = ({ question, answer, index }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="perspective-1000 h-48">
      <div
        className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front of card */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-800 rounded-lg border border-blue-200 dark:border-blue-700 p-4 flex flex-col justify-center items-center text-center shadow-sm hover:shadow-md transition-shadow">
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-2">
            QUESTION {index + 1}
          </div>
          <p className="text-gray-800 dark:text-white font-medium leading-relaxed">
            {question}
          </p>
          <div className="absolute bottom-3 right-3 text-xs text-blue-500 dark:text-blue-400">
            Click to reveal
          </div>
        </div>

        {/* Back of card */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900 dark:to-pink-800 rounded-lg border border-purple-200 dark:border-purple-700 p-4 flex flex-col justify-center items-center text-center shadow-sm hover:shadow-md transition-shadow">
          <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-2">
            ANSWER
          </div>
          <p className="text-gray-800 dark:text-white leading-relaxed">
            {answer}
          </p>
          <div className="absolute bottom-3 right-3 text-xs text-purple-500 dark:text-purple-400">
            Click to flip back
          </div>
        </div>
      </div>
    </div>
  );
};
