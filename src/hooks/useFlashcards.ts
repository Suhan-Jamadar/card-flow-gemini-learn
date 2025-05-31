
import { useState, useEffect, useMemo, useCallback } from 'react';
import { FlashcardSet, Flashcard } from '@/types/flashcard';
import { SortOption, FilterOption } from '@/components/SearchAndFilter';

const STORAGE_KEY = 'flashcards-pro-data';

// Data migration function to ensure all cards have proper isRead boolean values
const migrateFlashcardsData = (flashcards: any[]): FlashcardSet[] => {
  return flashcards.map(set => ({
    ...set,
    cards: set.cards.map((card: any) => ({
      ...card,
      isRead: Boolean(card.isRead) // Convert undefined/null to false, true to true
    }))
  }));
};

export const useFlashcards = () => {
  const [flashcards, setFlashcards] = useState<FlashcardSet[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [updateCounter, setUpdateCounter] = useState(0);

  // Enhanced update trigger that increments a counter
  const triggerUpdate = useCallback(() => {
    console.log('🔄 Triggering filter update');
    setUpdateCounter(prev => prev + 1);
  }, []);

  // Load flashcards from localStorage on mount with data migration
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedFlashcards = JSON.parse(saved);
        const migratedFlashcards = migrateFlashcardsData(parsedFlashcards);
        console.log('📦 Loading flashcards:', migratedFlashcards);
        setFlashcards(migratedFlashcards);
        
        // Save migrated data back to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedFlashcards));
      } catch (error) {
        console.error('Failed to parse saved flashcards:', error);
      }
    }
  }, []);

  // Save to localStorage whenever flashcards change
  useEffect(() => {
    if (flashcards.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(flashcards));
      console.log('💾 Saved flashcards to localStorage');
    }
  }, [flashcards]);

  const addFlashcardSet = useCallback((setData: {
    name: string;
    cards: Flashcard[];
    priority: 'low' | 'medium' | 'high';
    isRead: boolean;
  }) => {
    // Limit cards to 5 and ensure they have isRead property set to false
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
    
    console.log('➕ Adding new flashcard set:', newSet.name);
    
    setFlashcards(prev => {
      const updated = [newSet, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    
    // Trigger immediate update
    setTimeout(() => triggerUpdate(), 100);
  }, [triggerUpdate]);

  const updateFlashcardSet = useCallback((id: string, updates: Partial<FlashcardSet>) => {
    console.log('🔄 Updating flashcard set:', id, updates);
    
    setFlashcards(prev => {
      const updated = prev.map(set => {
        if (set.id === id) {
          const updatedSet = { ...set, ...updates };
          console.log('✅ Updated set cards read states:', updatedSet.cards?.map(c => c.isRead) || 'no cards update');
          return updatedSet;
        }
        return set;
      });
      
      // Immediate localStorage save
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      console.log('💾 Saved updated flashcards to localStorage');
      
      return updated;
    });
    
    // Immediate update trigger
    triggerUpdate();
  }, [triggerUpdate]);

  const removeFlashcardSet = useCallback((id: string) => {
    setFlashcards(prev => {
      const filtered = prev.filter(set => set.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return filtered;
    });
    triggerUpdate();
  }, [triggerUpdate]);

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
  }, [flashcards, updateCounter]);

  // Apply filters and sorting with enhanced debugging and proper state tracking
  const filteredAndSortedFlashcards = useMemo(() => {
    console.log('🔍 Filter process starting');
    console.log('🔍 Total flashcards:', flashcards.length);
    console.log('🔍 Filter by:', filterBy);
    console.log('🔍 Update counter:', updateCounter);
    
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
      console.log('🔍 After search filter:', filtered.length);
    }

    // Apply status/priority filter with detailed logging
    if (filterBy !== 'all') {
      console.log('🔍 Applying filter:', filterBy);
      
      filtered = filtered.filter(set => {
        switch (filterBy) {
          case 'read': {
            // A set is "read" if ALL cards are read
            const allCardsRead = set.cards.length > 0 && set.cards.every(card => card.isRead === true);
            console.log(`📖 Set "${set.name}" - all cards read:`, allCardsRead, 'Cards:', set.cards.map((c, i) => `${i+1}:${c.isRead}`));
            return allCardsRead;
          }
          case 'unread': {
            // A set is "unread" if ANY card is unread
            const hasUnreadCards = set.cards.some(card => card.isRead === false);
            console.log(`📖 Set "${set.name}" - has unread cards:`, hasUnreadCards, 'Cards:', set.cards.map((c, i) => `${i+1}:${c.isRead}`));
            return hasUnreadCards;
          }
          case 'high': return set.priority === 'high';
          case 'medium': return set.priority === 'medium';
          case 'low': return set.priority === 'low';
          default: return true;
        }
      });
      
      console.log(`🔍 After ${filterBy} filter:`, filtered.length, 'sets');
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

    console.log('🔍 Final result:', sorted.length, 'sets');
    return sorted;
  }, [flashcards, searchTerm, filterBy, sortBy, updateCounter]);

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
    triggerForceUpdate: triggerUpdate,
  };
};
