
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
  const [forceUpdate, setForceUpdate] = useState(0);

  // Force update function to trigger re-renders
  const triggerForceUpdate = useCallback(() => {
    console.log('🔄 Force update triggered');
    setForceUpdate(prev => prev + 1);
  }, []);

  // Load flashcards from localStorage on mount with data migration
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedFlashcards = JSON.parse(saved);
        const migratedFlashcards = migrateFlashcardsData(parsedFlashcards);
        setFlashcards(migratedFlashcards);
        
        // Save migrated data back to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedFlashcards));
        console.log('📦 Loaded and migrated flashcards:', migratedFlashcards.length);
      } catch (error) {
        console.error('Failed to parse saved flashcards:', error);
      }
    }
  }, []);

  // Save to localStorage whenever flashcards change
  useEffect(() => {
    if (flashcards.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(flashcards));
      console.log('💾 Saved flashcards to localStorage:', flashcards.length);
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
    
    console.log('➕ Adding new flashcard set:', newSet.name, 'with', limitedCards.length, 'cards');
    
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
    console.log('🔄 Updating flashcard set:', id, 'with updates:', updates);
    
    setFlashcards(prev => {
      const updated = prev.map(set => {
        if (set.id === id) {
          const updatedSet = { ...set, ...updates };
          console.log('✅ Updated set:', updatedSet.name, 'cards:', updatedSet.cards.map(c => c.isRead));
          return updatedSet;
        }
        return set;
      });
      
      // Immediate localStorage save
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      
      return updated;
    });
    
    // Trigger force update immediately
    triggerForceUpdate();
  }, [triggerForceUpdate]);

  const removeFlashcardSet = useCallback((id: string) => {
    setFlashcards(prev => {
      const filtered = prev.filter(set => set.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
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

  // Apply filters and sorting with enhanced debugging
  const filteredAndSortedFlashcards = useMemo(() => {
    console.log('🔍 Starting filter process with', flashcards.length, 'total flashcards');
    console.log('🔍 Filter by:', filterBy, 'Search term:', searchTerm);
    
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
      console.log('🔍 After search filter:', filtered.length, 'sets');
    }

    // Apply status/priority filter with enhanced logic
    if (filterBy !== 'all') {
      const beforeFilterCount = filtered.length;
      
      filtered = filtered.filter(set => {
        switch (filterBy) {
          case 'read': 
            // A set is considered "read" if ALL its cards are read (isRead === true)
            const isSetRead = set.cards.length > 0 && set.cards.every(card => card.isRead === true);
            console.log(`📖 Set "${set.name}" read status:`, isSetRead, 'Cards:', set.cards.map(c => c.isRead));
            return isSetRead;
          case 'unread': 
            // A set is considered "unread" if ANY card is unread (isRead === false)
            const isSetUnread = set.cards.some(card => card.isRead === false);
            console.log(`📖 Set "${set.name}" unread status:`, isSetUnread, 'Cards:', set.cards.map(c => c.isRead));
            return isSetUnread;
          case 'high': return set.priority === 'high';
          case 'medium': return set.priority === 'medium';
          case 'low': return set.priority === 'low';
          default: return true;
        }
      });
      
      console.log(`🔍 After ${filterBy} filter: ${filtered.length} sets (was ${beforeFilterCount})`);
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

    console.log('🔍 Final filtered and sorted result:', sorted.length, 'sets');
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
