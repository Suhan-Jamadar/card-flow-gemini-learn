
import React, { useState, useEffect, useCallback } from 'react';
import { FlashcardGenerator } from '@/components/FlashcardGenerator';
import { FlashcardDisplay } from '@/components/FlashcardDisplay';
import { GroupedFlashcardDisplay } from '@/components/GroupedFlashcardDisplay';
import { SearchAndFilter } from '@/components/SearchAndFilter';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useDarkMode } from '@/hooks/useDarkMode';
import { Plus, Moon, Sun, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  const [showGenerator, setShowGenerator] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grouped'>('list');
  const [activeTab, setActiveTab] = useState('all');
  const [renderKey, setRenderKey] = useState(0);
  
  const { 
    flashcards, 
    searchTerm, 
    setSearchTerm, 
    sortBy, 
    setSortBy, 
    filterBy, 
    setFilterBy,
    filteredFlashcards,
    groupedFlashcards,
    triggerForceUpdate
  } = useFlashcards();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  // Debug logging with more detail
  console.log('=== INDEX RENDER START ===');
  console.log('Render key:', renderKey);
  console.log('Index component render - flashcards count:', flashcards.length);
  console.log('Index component render - flashcards:', flashcards);
  console.log('Index component render - filteredFlashcards count:', filteredFlashcards.length);
  console.log('Index component render - filteredFlashcards:', filteredFlashcards);
  console.log('Index component render - activeTab:', activeTab);
  console.log('Index component render - viewMode:', viewMode);

  const highPriorityFlashcards = filteredFlashcards.filter(card => card.priority === 'high');
  const regularFlashcards = filteredFlashcards.filter(card => card.priority !== 'high');

  console.log('High priority flashcards count:', highPriorityFlashcards.length);
  console.log('High priority flashcards:', highPriorityFlashcards);
  console.log('Regular flashcards count:', regularFlashcards.length);
  console.log('Regular flashcards:', regularFlashcards);

  // Force re-render when flashcards change
  useEffect(() => {
    console.log('Flashcards state changed, forcing component update. Count:', flashcards.length);
    setRenderKey(prev => prev + 1);
  }, [flashcards]);

  // Auto-switch to high priority tab when new high priority flashcards are added
  useEffect(() => {
    console.log('useEffect for auto-switching tabs triggered');
    console.log('Current flashcards:', flashcards);
    const lastFlashcard = flashcards[0]; // Most recent flashcard (added at beginning)
    if (lastFlashcard && lastFlashcard.priority === 'high' && viewMode === 'list') {
      console.log('Switching to priority tab for new high priority flashcard:', lastFlashcard);
      setActiveTab('priority');
    }
  }, [flashcards, viewMode]);

  const handleGeneratorClose = useCallback(() => {
    console.log('=== GENERATOR CLOSING ===');
    console.log('Generator closing...');
    setShowGenerator(false);
    
    // Ensure we're in list view to see the new flashcards
    if (viewMode === 'grouped') {
      console.log('Switching from grouped to list view');
      setViewMode('list');
    }
    
    // Force update to ensure immediate display
    setTimeout(() => {
      console.log('Forcing update after generator close');
      triggerForceUpdate();
      setRenderKey(prev => prev + 1);
    }, 200);
    
    console.log('=== GENERATOR CLOSE COMPLETE ===');
  }, [viewMode, triggerForceUpdate]);

  // Force refresh function for debugging
  const handleForceRefresh = useCallback(() => {
    console.log('=== MANUAL FORCE REFRESH ===');
    triggerForceUpdate();
    setRenderKey(prev => prev + 1);
  }, [triggerForceUpdate]);

  console.log('=== INDEX RENDER END ===');

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FlashCards Pro
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Smart learning made simple • {flashcards.length} total sets
              {highPriorityFlashcards.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full text-xs font-medium">
                  🔥 {highPriorityFlashcards.length} high priority
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setViewMode(viewMode === 'list' ? 'grouped' : 'list')}
              variant="outline"
              size="icon"
              className="border-gray-200 dark:border-gray-700"
              title={viewMode === 'list' ? 'Switch to grouped view' : 'Switch to list view'}
            >
              {viewMode === 'list' ? <Grid className="h-5 w-5" /> : <List className="h-5 w-5" />}
            </Button>
            <Button
              onClick={toggleDarkMode}
              variant="outline"
              size="icon"
              className="border-gray-200 dark:border-gray-700"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button
              onClick={() => setShowGenerator(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Flashcards
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <SearchAndFilter 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
          filterBy={filterBy}
          setFilterBy={setFilterBy}
        />

        {/* Enhanced Debug Info */}
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">Debug Information:</h3>
            <Button 
              onClick={handleForceRefresh}
              size="sm"
              variant="outline"
              className="text-xs border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              Force Refresh
            </Button>
          </div>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <div>Total flashcards in state: {flashcards.length}</div>
            <div>Filtered flashcards: {filteredFlashcards.length}</div>
            <div>High priority: {highPriorityFlashcards.length}</div>
            <div>Regular priority: {regularFlashcards.length}</div>
            <div>Active tab: {activeTab}</div>
            <div>View mode: {viewMode}</div>
            <div>Render key: {renderKey}</div>
            <div>LocalStorage check: {localStorage.getItem('flashcards-pro-data') ? 'Data found' : 'No data'}</div>
          </div>
        </div>

        {/* View Toggle and Flashcard Display */}
        <div className="mt-8" key={`display-${renderKey}`}>
          {viewMode === 'grouped' ? (
            <GroupedFlashcardDisplay groupedFlashcards={groupedFlashcards} />
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-200"
                >
                  📚 All Cards ({regularFlashcards.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="priority" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all duration-200"
                >
                  🔥 High Priority ({highPriorityFlashcards.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-6" key={`all-${renderKey}`}>
                {regularFlashcards.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 rounded-lg flex items-center justify-center text-2xl">
                        📚
                      </div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No regular flashcards found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Create your first flashcard set to get started!
                    </p>
                  </div>
                ) : (
                  <FlashcardDisplay flashcards={regularFlashcards} />
                )}
              </TabsContent>
              
              <TabsContent value="priority" className="mt-6" key={`priority-${renderKey}`}>
                {highPriorityFlashcards.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900 dark:to-pink-900 rounded-full flex items-center justify-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-200 to-pink-200 dark:from-red-800 dark:to-pink-800 rounded-lg flex items-center justify-center text-2xl">
                        🔥
                      </div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No high priority flashcards
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Mark flashcards as high priority to see them here!
                    </p>
                  </div>
                ) : (
                  <FlashcardDisplay flashcards={highPriorityFlashcards} />
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Generator Modal */}
        {showGenerator && (
          <FlashcardGenerator onClose={handleGeneratorClose} />
        )}
      </div>
    </div>
  );
};

export default Index;
