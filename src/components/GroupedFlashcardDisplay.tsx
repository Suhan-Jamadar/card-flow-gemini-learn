
import React from 'react';
import { FlashcardSet } from '@/types/flashcard';
import { FlashcardGroup } from './FlashcardGroup';

interface GroupedFlashcardDisplayProps {
  groupedFlashcards: { [key: string]: FlashcardSet[] };
}

export const GroupedFlashcardDisplay: React.FC<GroupedFlashcardDisplayProps> = ({ 
  groupedFlashcards 
}) => {
  const groupNames = Object.keys(groupedFlashcards);

  if (groupNames.length === 0) {
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

  return (
    <div className="space-y-8">
      {groupNames.map((groupName) => {
        const sets = groupedFlashcards[groupName];
        const totalCards = sets.reduce((sum, set) => sum + set.cards.length, 0);
        
        return (
          <div key={groupName} className="space-y-4">
            {/* Group Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                {sets[0].name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {sets.length} set{sets.length > 1 ? 's' : ''} • {totalCards} total cards
              </p>
            </div>
            
            {/* Flashcard Sets in this group */}
            <div className="space-y-6">
              {sets.map((flashcardSet) => (
                <FlashcardGroup key={flashcardSet.id} flashcardSet={flashcardSet} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
