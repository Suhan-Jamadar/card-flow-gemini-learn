
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
  Trash2
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
      title: flashcardSet.isRead ? "📖 Marked as Unread" : "✅ Marked as Read",
      description: `"${flashcardSet.name}" has been updated.`,
    });
  };

  const handlePriorityChange = (priority: 'low' | 'medium' | 'high') => {
    updateFlashcardSet(flashcardSet.id, { priority });
    
    const priorityEmojis = { high: '🔥', medium: '⭐', low: '📌' };
    const priorityTexts = { high: 'High Priority', medium: 'Medium Priority', low: 'Low Priority' };
    
    toast({
      title: `${priorityEmojis[priority]} Priority Updated`,
      description: `"${flashcardSet.name}" is now ${priorityTexts[priority]}.`,
    });
  };

  const handleDownload = () => {
    // Enhanced download content with fixed header and footer
    const content = `╔══════════════════════════════════════════════════════════════════════╗
║                                HIRE-AI                                ║
║              Smart AI Solutions for Modern Businesses                 ║
║           Revolutionizing recruitment with AI technology              ║
╚══════════════════════════════════════════════════════════════════════╝

Flashcard Set: ${flashcardSet.name}
Created: ${new Date(flashcardSet.createdAt).toLocaleDateString()}
Priority: ${flashcardSet.priority.toUpperCase()}
Total Cards: ${flashcardSet.cards.length}
Status: ${flashcardSet.isRead ? 'Read' : 'Unread'}

${'='.repeat(75)}
                            FLASHCARD CONTENT
${'='.repeat(75)}

${flashcardSet.cards
  .map((card, index) => `
┌─────────────────────────────────────────────────────────────────────┐
│ CARD ${(index + 1).toString().padStart(2, '0')}                                                          │
├─────────────────────────────────────────────────────────────────────┤
│ QUESTION:                                                           │
│ ${card.question.split('\n').map(line => `│ ${line.padEnd(67)} │`).join('\n')}
├─────────────────────────────────────────────────────────────────────┤
│ ANSWER:                                                             │
│ ${card.answer.split('\n').map(line => `│ ${line.padEnd(67)} │`).join('\n')}
└─────────────────────────────────────────────────────────────────────┘
`)
  .join('\n')}

${'='.repeat(75)}

╔══════════════════════════════════════════════════════════════════════╗
║                          CREATED BY                                 ║
║                      Suhan Jamadar Team                             ║
║                         HIRE-AI                                     ║
║                    Created with Gemini AI                           ║
║                                                                      ║
║               © 2024 Hire-AI. All rights reserved.                  ║
╚══════════════════════════════════════════════════════════════════════╝

Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
Total Study Time Estimated: ${flashcardSet.cards.length * 2} minutes`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${flashcardSet.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_hire_ai_flashcards.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "📥 Download Complete",
      description: `"${flashcardSet.name}" flashcards downloaded with Hire-AI branding.`,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔥';
      case 'medium': return '⭐';
      case 'low': return '📌';
      default: return '';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-3 text-left group"
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
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
              <Badge className={`${getPriorityColor(flashcardSet.priority)} font-medium`}>
                {getPriorityIcon(flashcardSet.priority)} {flashcardSet.priority}
              </Badge>
              {flashcardSet.isRead && (
                <Badge variant="outline" className="border-green-200 text-green-700 dark:border-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950">
                  ✅ Read
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Mark as Read/Unread Button */}
            <Button
              onClick={handleToggleRead}
              variant="outline"
              size="sm"
              className={flashcardSet.isRead 
                ? "border-yellow-200 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-300 dark:border-yellow-700 dark:text-yellow-300 dark:hover:bg-yellow-950"
                : "border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-950"
              }
              title={flashcardSet.isRead ? "Mark as Unread" : "Mark as Read"}
            >
              {flashcardSet.isRead ? (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  Unread
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  Read
                </>
              )}
            </Button>

            {/* Download Button */}
            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
              className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-950"
              title={`Download "${flashcardSet.name}" flashcards`}
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-gray-700">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => handlePriorityChange('high')}>
                  <Flag className="h-4 w-4 mr-2 text-red-500" />
                  High Priority 🔥
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePriorityChange('medium')}>
                  <Star className="h-4 w-4 mr-2 text-yellow-500" />
                  Medium Priority ⭐
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePriorityChange('low')}>
                  <StarOff className="h-4 w-4 mr-2 text-green-500" />
                  Low Priority 📌
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600 dark:text-red-400">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Set
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 bg-gray-50 dark:bg-gray-900/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flashcardSet.cards.map((card, index) => (
              <FlashcardItem 
                key={index}
                question={card.question}
                answer={card.answer}
                index={index}
                flashcardSetId={flashcardSet.id}
                isRead={card.isRead || false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  function handleDelete() {
    removeFlashcardSet(flashcardSet.id);
    toast({
      title: "🗑️ Flashcard Set Deleted",
      description: `"${flashcardSet.name}" has been permanently removed.`,
      variant: "destructive"
    });
  }
};
