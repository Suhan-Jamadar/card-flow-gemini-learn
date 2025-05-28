
import React, { useState } from 'react';
import { FlashcardGenerator } from '@/components/FlashcardGenerator';
import { FlashcardDisplay } from '@/components/FlashcardDisplay';
import { SearchAndFilter } from '@/components/SearchAndFilter';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useDarkMode } from '@/hooks/useDarkMode';
import { Plus, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  const [showGenerator, setShowGenerator] = useState(false);
  const { flashcards, searchTerm, setSearchTerm, filteredFlashcards } = useFlashcards();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const highPriorityFlashcards = filteredFlashcards.filter(card => card.priority === 'high');
  const regularFlashcards = filteredFlashcards.filter(card => card.priority !== 'high');

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
              Smart learning made simple
            </p>
          </div>
          <div className="flex gap-3">
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
        />

        {/* Flashcard Display */}
        <Tabs defaultValue="all" className="mt-8">
          <TabsList className="grid w-full grid-cols-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              All Cards ({regularFlashcards.length})
            </TabsTrigger>
            <TabsTrigger value="priority" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              High Priority ({highPriorityFlashcards.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <FlashcardDisplay flashcards={regularFlashcards} />
          </TabsContent>
          
          <TabsContent value="priority" className="mt-6">
            <FlashcardDisplay flashcards={highPriorityFlashcards} />
          </TabsContent>
        </Tabs>

        {/* Generator Modal */}
        {showGenerator && (
          <FlashcardGenerator onClose={() => setShowGenerator(false)} />
        )}
      </div>
    </div>
  );
};

export default Index;
