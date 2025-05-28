
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useFlashcards } from '@/hooks/useFlashcards';
import { X, Upload, FileText, Wand2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FlashcardGeneratorProps {
  onClose: () => void;
}

export const FlashcardGenerator: React.FC<FlashcardGeneratorProps> = ({ onClose }) => {
  const [setName, setSetName] = useState('');
  const [textInput, setTextInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { addFlashcardSet } = useFlashcards();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setTextInput(''); // Clear text input if file is uploaded
    }
  };

  const generateFlashcards = async () => {
    if (!setName.trim()) {
      toast({
        title: "Missing Set Name",
        description: "Please provide a name for your flashcard set.",
        variant: "destructive"
      });
      return;
    }

    if (!textInput.trim() && !file) {
      toast({
        title: "No Content Provided",
        description: "Please provide text input or upload a file.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Simulate flashcard generation (replace with actual Gemini API call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock generated flashcards
      const mockFlashcards = [
        { question: "What is React?", answer: "A JavaScript library for building user interfaces" },
        { question: "What is a component?", answer: "A reusable piece of UI that can contain state and props" },
        { question: "What is JSX?", answer: "A syntax extension for JavaScript that looks similar to XML or HTML" },
      ];

      addFlashcardSet({
        name: setName,
        cards: mockFlashcards,
        priority: 'medium',
        isRead: false
      });

      toast({
        title: "Flashcards Generated!",
        description: `Successfully created ${mockFlashcards.length} flashcards for "${setName}".`,
      });

      onClose();
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate flashcards. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Generate Flashcards
            </h2>
            <Button 
              onClick={onClose} 
              variant="ghost" 
              size="icon"
              className="hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <Label htmlFor="setName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Flashcard Set Name *
              </Label>
              <Input
                id="setName"
                value={setName}
                onChange={(e) => setSetName(e.target.value)}
                placeholder="e.g., React Fundamentals"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Content Source
              </Label>
              <div className="mt-2 space-y-4">
                <div>
                  <Label htmlFor="textInput" className="text-sm text-gray-600 dark:text-gray-400">
                    Text Input
                  </Label>
                  <Textarea
                    id="textInput"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Paste your text content here..."
                    rows={6}
                    className="mt-1"
                    disabled={!!file}
                  />
                </div>

                <div className="flex items-center justify-center">
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm rounded-full">
                    OR
                  </span>
                </div>

                <div>
                  <Label htmlFor="fileUpload" className="text-sm text-gray-600 dark:text-gray-400">
                    Upload Document
                  </Label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label
                          htmlFor="fileUpload"
                          className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="fileUpload"
                            type="file"
                            className="sr-only"
                            accept=".pdf,.docx,.txt"
                            onChange={handleFileUpload}
                            disabled={!!textInput.trim()}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PDF, DOCX, TXT up to 10MB
                      </p>
                    </div>
                  </div>
                  {file && (
                    <div className="mt-2 flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <FileText className="h-4 w-4 mr-2" />
                      {file.name}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                onClick={onClose} 
                variant="outline"
                className="border-gray-200 dark:border-gray-700"
              >
                Cancel
              </Button>
              <Button 
                onClick={generateFlashcards}
                disabled={isGenerating}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Flashcards
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
