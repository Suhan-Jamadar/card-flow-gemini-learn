
import { useState, useEffect, useMemo, useCallback } from 'react';
import { FlashcardSet, Flashcard } from '@/types/flashcard';
import { SortOption, FilterOption } from '@/components/SearchAndFilter';

const STORAGE_KEY = 'flashcards-pro-data';

export const useFlashcards = () => {
  const [flashcards, setFlashcards] = useState<FlashcardSet[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [forceUpdate, setForceUpdate] = useState(0);

  // Force update function to trigger re-renders
  const triggerForceUpdate = useCallback(() => {
    setForceUpdate(prev => prev + 1);
  }, []);

  // Load flashcards from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedFlashcards = JSON.parse(saved);
        setFlashcards(parsedFlashcards);
      } catch (error) {
        console.error('Failed to parse saved flashcards:', error);
      }
    }
  }, []);

  // Save to localStorage whenever flashcards change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flashcards));
  }, [flashcards]);

  const addFlashcardSet = useCallback((setData: {
    name: string;
    cards: Flashcard[];
    priority: 'low' | 'medium' | 'high';
    isRead: boolean;
  }) => {
    // Limit cards to 5 and ensure they have isRead property
    const limitedCards = setData.cards.slice(0, 5).map(card => ({
      ...card,
      isRead: false // Initialize all new cards as unread
    }));
    
    const newSet: FlashcardSet = {
      id: Date.now().toString(),
      ...setData,
      cards: limitedCards,
      createdAt: new Date().toISOString(),
    };
    
    // Use functional update to ensure we get the latest state
    setFlashcards(prev => {
      const updatedFlashcards = [newSet, ...prev];
      
      // Immediate localStorage save
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFlashcards));
      
      return updatedFlashcards;
    });
    
    // Trigger force update after a short delay to ensure state propagation
    setTimeout(() => {
      triggerForceUpdate();
    }, 100);
  }, [triggerForceUpdate]);

  const updateFlashcardSet = useCallback((id: string, updates: Partial<FlashcardSet>) => {
    setFlashcards(prev => {
      const updated = prev.map(set => (set.id === id ? { ...set, ...updates } : set));
      return updated;
    });
    triggerForceUpdate();
  }, [triggerForceUpdate]);

  const removeFlashcardSet = useCallback((id: string) => {
    setFlashcards(prev => {
      const filtered = prev.filter(set => set.id !== id);
      return filtered;
    });
    triggerForceUpdate();
  }, [triggerForceUpdate]);

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
  }, [flashcards, forceUpdate]);

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
          case 'read': 
            // A set is considered "read" if ALL its cards are read
            return set.cards.length > 0 && set.cards.every(card => card.isRead === true);
          case 'unread': 
            // A set is considered "unread" if ANY card is unread
            return set.cards.some(card => card.isRead !== true);
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
  }, [flashcards, searchTerm, filterBy, sortBy, forceUpdate]);

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
    triggerForceUpdate,
  };
};
