
import { useState, useEffect, useMemo } from 'react';
import { FlashcardSet, Flashcard } from '@/types/flashcard';
import { SortOption, FilterOption } from '@/components/SearchAndFilter';

const STORAGE_KEY = 'flashcards-pro-data';

export const useFlashcards = () => {
  const [flashcards, setFlashcards] = useState<FlashcardSet[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

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

  // Group flashcards by name
  const groupedFlashcards = useMemo(() => {
    const groups: { [key: string]: FlashcardSet[] } = {};
    
    flashcards.forEach(set => {
      const groupKey = set.name.toLowerCase().trim();
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(set);
    });

    return groups;
  }, [flashcards]);

  // Apply filters and sorting
  const filteredAndSortedFlashcards = useMemo(() => {
    let filtered = flashcards;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(set =>
        set.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        set.cards.some(card => 
          card.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.answer.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply status/priority filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(set => {
        switch (filterBy) {
          case 'read': return set.isRead;
          case 'unread': return !set.isRead;
          case 'high': return set.priority === 'high';
          case 'medium': return set.priority === 'medium';
          case 'low': return set.priority === 'low';
          default: return true;
        }
      });
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'date-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'date-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        default:
          return 0;
      }
    });

    return sorted;
  }, [flashcards, searchTerm, filterBy, sortBy]);

  return {
    flashcards,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    filterBy,
    setFilterBy,
    filteredFlashcards: filteredAndSortedFlashcards,
    groupedFlashcards,
    addFlashcardSet,
    updateFlashcardSet,
    removeFlashcardSet,
  };
};
