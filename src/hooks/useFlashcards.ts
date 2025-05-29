
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
    console.log('Loading flashcards from localStorage...');
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedFlashcards = JSON.parse(saved);
        console.log('Loaded flashcards from localStorage:', parsedFlashcards);
        setFlashcards(parsedFlashcards);
      } catch (error) {
        console.error('Failed to parse saved flashcards:', error);
      }
    } else {
      console.log('No saved flashcards found in localStorage');
    }
  }, []);

  // Save to localStorage whenever flashcards change
  useEffect(() => {
    console.log('Saving flashcards to localStorage:', flashcards);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flashcards));
  }, [flashcards]);

  const addFlashcardSet = (setData: {
    name: string;
    cards: Flashcard[];
    priority: 'low' | 'medium' | 'high';
    isRead: boolean;
  }) => {
    console.log('Adding new flashcard set:', setData);
    const newSet: FlashcardSet = {
      id: Date.now().toString(),
      ...setData,
      createdAt: new Date().toISOString(),
    };
    console.log('Created new flashcard set:', newSet);
    
    // Use functional update to ensure we get the latest state
    setFlashcards(prev => {
      const updatedFlashcards = [newSet, ...prev];
      console.log('Updated flashcards array:', updatedFlashcards);
      console.log('Total flashcards after adding:', updatedFlashcards.length);
      return updatedFlashcards;
    });
  };

  const updateFlashcardSet = (id: string, updates: Partial<FlashcardSet>) => {
    console.log('Updating flashcard set:', id, updates);
    setFlashcards(prev =>
      prev.map(set => (set.id === id ? { ...set, ...updates } : set))
    );
  };

  const removeFlashcardSet = (id: string) => {
    console.log('Removing flashcard set:', id);
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

    console.log('Grouped flashcards:', groups);
    return groups;
  }, [flashcards]);

  // Apply filters and sorting
  const filteredAndSortedFlashcards = useMemo(() => {
    console.log('Applying filters - searchTerm:', searchTerm, 'filterBy:', filterBy, 'sortBy:', sortBy);
    console.log('Base flashcards for filtering:', flashcards);
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
      console.log('After search filter:', filtered);
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
      console.log('After priority/status filter:', filtered);
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

    console.log('Final filtered and sorted flashcards:', sorted);
    return sorted;
  }, [flashcards, searchTerm, filterBy, sortBy]);

  console.log('Current hook state:', {
    totalFlashcards: flashcards.length,
    filteredFlashcards: filteredAndSortedFlashcards.length,
    searchTerm,
    filterBy,
    sortBy
  });

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
