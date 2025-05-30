
import React from 'react';
import { FlashcardSet } from '@/types/flashcard';
import { FlashcardGroup } from './FlashcardGroup';

interface FlashcardDisplayProps {
  flashcards: FlashcardSet[];
}

export const FlashcardDisplay: React.FC<FlashcardDisplayProps> = ({ flashcards }) => {
  console.log('FlashcardDisplay rendering with flashcards:', flashcards);
  console.log('FlashcardDisplay flashcards count:', flashcards.length);

  if (flashcards.length === 0) {
    console.log('FlashcardDisplay: No flashcards to display');
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No flashcards found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Create your first flashcard set to get started!
        </p>
      </div>
    );
  }

  console.log('FlashcardDisplay: Rendering', flashcards.length, 'flashcard sets');

  return (
    <div className="space-y-8">
      {flashcards.map((flashcardSet, index) => {
        console.log(`Rendering FlashcardGroup ${index}:`, flashcardSet);
        return (
          <FlashcardGroup key={`${flashcardSet.id}-${index}`} flashcardSet={flashcardSet} />
        );
      })}
    </div>
  );
};
