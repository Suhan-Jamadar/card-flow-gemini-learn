
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { useFlashcards } from '@/hooks/useFlashcards';
import { toast } from '@/hooks/use-toast';

interface FlashcardItemProps {
  question: string;
  answer: string;
  index: number;
  flashcardSetId: string;
}

export const FlashcardItem: React.FC<FlashcardItemProps> = ({ 
  question, 
  answer, 
  index, 
  flashcardSetId 
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const { updateFlashcardSet, flashcards } = useFlashcards();

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip when clicking button
    setIsRead(!isRead);
    
    // Also mark the entire set as read if this is the last unread card
    const flashcardSet = flashcards.find(set => set.id === flashcardSetId);
    if (flashcardSet && !isRead) {
      toast({
        title: "✅ Card Marked as Read",
        description: `Question ${index + 1} completed!`,
      });
    }
  };

  return (
    <div className="perspective-1000 h-48 relative">
      <div
        className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front of card */}
        <div className={`absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-800 rounded-lg border border-blue-200 dark:border-blue-700 p-4 flex flex-col justify-center items-center text-center shadow-sm hover:shadow-md transition-shadow ${
          isRead ? 'opacity-75 border-green-300 dark:border-green-600' : ''
        }`}>
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-2">
            QUESTION {index + 1}
          </div>
          <p className="text-gray-800 dark:text-white font-medium leading-relaxed text-sm">
            {question}
          </p>
          <div className="absolute bottom-3 right-3 text-xs text-blue-500 dark:text-blue-400">
            Click to reveal
          </div>
          
          {/* Mark as Read Button */}
          <Button
            onClick={handleMarkAsRead}
            variant="ghost"
            size="sm"
            className={`absolute top-2 right-2 p-1 h-6 w-6 ${
              isRead 
                ? 'text-green-600 hover:text-green-700 bg-green-100 hover:bg-green-200 dark:text-green-400 dark:bg-green-900 dark:hover:bg-green-800' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title={isRead ? "Mark as unread" : "Mark as read"}
          >
            {isRead ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          </Button>
        </div>

        {/* Back of card */}
        <div className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900 dark:to-pink-800 rounded-lg border border-purple-200 dark:border-purple-700 p-4 flex flex-col justify-center items-center text-center shadow-sm hover:shadow-md transition-shadow ${
          isRead ? 'opacity-75 border-green-300 dark:border-green-600' : ''
        }`}>
          <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-2">
            ANSWER
          </div>
          <p className="text-gray-800 dark:text-white leading-relaxed text-sm">
            {answer}
          </p>
          <div className="absolute bottom-3 right-3 text-xs text-purple-500 dark:text-purple-400">
            Click to flip back
          </div>
          
          {/* Mark as Read Button on back too */}
          <Button
            onClick={handleMarkAsRead}
            variant="ghost"
            size="sm"
            className={`absolute top-2 right-2 p-1 h-6 w-6 ${
              isRead 
                ? 'text-green-600 hover:text-green-700 bg-green-100 hover:bg-green-200 dark:text-green-400 dark:bg-green-900 dark:hover:bg-green-800' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title={isRead ? "Mark as unread" : "Mark as read"}
          >
            {isRead ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          </Button>
        </div>
      </div>
      
      {/* Read indicator */}
      {isRead && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center z-10">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      )}
    </div>
  );
};
