
import { useState, useEffect } from 'react';
import { FlashcardSet, Flashcard } from '@/types/flashcard';

const STORAGE_KEY = 'flashcards-pro-data';

export const useFlashcards = () => {
  const [flashcards, setFlashcards] = useState<FlashcardSet[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Load flashcards from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setFlashcards(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse saved flashcards:', error);
      }
    }
  }, []);

  // Save to localStorage whenever flashcards change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flashcards));
  }, [flashcards]);

  const addFlashcardSet = (setData: {
    name: string;
    cards: Flashcard[];
    priority: 'low' | 'medium' | 'high';
    isRead: boolean;
  }) => {
    const newSet: FlashcardSet = {
      id: Date.now().toString(),
      ...setData,
      createdAt: new Date().toISOString(),
    };
    setFlashcards(prev => [newSet, ...prev]);
  };

  const updateFlashcardSet = (id: string, updates: Partial<FlashcardSet>) => {
    setFlashcards(prev =>
      prev.map(set => (set.id === id ? { ...set, ...updates } : set))
    );
  };

  const removeFlashcardSet = (id: string) => {
    setFlashcards(prev => prev.filter(set => set.id !== id));
  };

  const filteredFlashcards = flashcards.filter(set =>
    set.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    set.cards.some(card => 
      card.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return {
    flashcards,
    searchTerm,
    setSearchTerm,
    filteredFlashcards,
    addFlashcardSet,
    updateFlashcardSet,
    removeFlashcardSet,
  };
};
