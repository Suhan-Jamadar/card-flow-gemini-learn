
import React, { useState } from 'react';
import { FlashcardSet } from '@/types/flashcard';
import { FlashcardItem } from './FlashcardItem';
import { useFlashcards } from '@/hooks/useFlashcards';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  Download, 
  Eye, 
  EyeOff, 
  Flag, 
  Star,
  StarOff,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';

interface FlashcardGroupProps {
  flashcardSet: FlashcardSet;
}

export const FlashcardGroup: React.FC<FlashcardGroupProps> = ({ flashcardSet }) => {
  const { updateFlashcardSet, removeFlashcardSet } = useFlashcards();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleToggleRead = () => {
    updateFlashcardSet(flashcardSet.id, { isRead: !flashcardSet.isRead });
    toast({
      title: flashcardSet.isRead ? "Marked as Unread" : "Marked as Read",
      description: `"${flashcardSet.name}" has been updated.`,
    });
  };

  const handlePriorityChange = (priority: 'low' | 'medium' | 'high') => {
    updateFlashcardSet(flashcardSet.id, { priority });
    toast({
      title: "Priority Updated",
      description: `"${flashcardSet.name}" priority set to ${priority}.`,
    });
  };

  const handleDownload = () => {
    const content = `Flashcard Set: ${flashcardSet.name}\nCreated: ${new Date(flashcardSet.createdAt).toLocaleDateString()}\nPriority: ${flashcardSet.priority}\nTotal Cards: ${flashcardSet.cards.length}\n\n` +
      flashcardSet.cards
        .map((card, index) => `Card ${index + 1}:\nQ: ${card.question}\nA: ${card.answer}\n`)
        .join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${flashcardSet.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_flashcards.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download Started",
      description: `"${flashcardSet.name}" flashcards downloaded.`,
    });
  };

  const handleDelete = () => {
    removeFlashcardSet(flashcardSet.id);
    toast({
      title: "Flashcard Set Deleted",
      description: `"${flashcardSet.name}" has been removed.`,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-2 text-left group"
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
              )}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {flashcardSet.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {flashcardSet.cards.length} cards • Created {new Date(flashcardSet.createdAt).toLocaleDateString()}
                </p>
              </div>
            </button>
            
            <div className="flex items-center space-x-2">
              <Badge className={getPriorityColor(flashcardSet.priority)}>
                {flashcardSet.priority}
              </Badge>
              {flashcardSet.isRead && (
                <Badge variant="outline" className="border-green-200 text-green-700 dark:border-green-700 dark:text-green-300">
                  Read
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
              className="border-gray-200 dark:border-gray-700"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleToggleRead}>
                  {flashcardSet.isRead ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Mark as Unread
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Mark as Read
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePriorityChange('high')}>
                  <Flag className="h-4 w-4 mr-2 text-red-500" />
                  High Priority
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePriorityChange('medium')}>
                  <Star className="h-4 w-4 mr-2 text-yellow-500" />
                  Medium Priority
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePriorityChange('low')}>
                  <StarOff className="h-4 w-4 mr-2 text-green-500" />
                  Low Priority
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                  <X className="h-4 w-4 mr-2" />
                  Delete Set
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flashcardSet.cards.map((card, index) => (
              <FlashcardItem 
                key={index}
                question={card.question}
                answer={card.answer}
                index={index}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
