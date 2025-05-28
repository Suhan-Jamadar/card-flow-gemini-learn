
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setTextInput('');
      
      // Process the file content
      try {
        const text = await extractTextFromFile(uploadedFile);
        setTextInput(text);
        toast({
          title: "File Processed",
          description: `Successfully extracted text from ${uploadedFile.name}`,
        });
      } catch (error) {
        toast({
          title: "File Processing Error",
          description: "Failed to extract text from the file. Please try a different file.",
          variant: "destructive"
        });
        setFile(null);
      }
    }
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text && text.trim()) {
          resolve(text);
        } else {
          reject(new Error('No text content found'));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      
      // For now, we'll treat all files as text files
      // In a real implementation, you'd use different parsers for PDF, DOCX, etc.
      reader.readAsText(file);
    });
  };

  const generateFlashcardsFromText = (text: string) => {
    // Simple flashcard generation from text
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const flashcards = [];
    
    for (let i = 0; i < Math.min(sentences.length, 10); i += 2) {
      if (sentences[i] && sentences[i + 1]) {
        flashcards.push({
          question: sentences[i].trim() + '?',
          answer: sentences[i + 1].trim()
        });
      }
    }
    
    // If we don't have enough content, create some sample cards
    if (flashcards.length === 0) {
      const words = text.split(' ').filter(w => w.length > 3);
      const uniqueWords = [...new Set(words)].slice(0, 5);
      
      uniqueWords.forEach(word => {
        flashcards.push({
          question: `What does "${word}" mean?`,
          answer: `Define or explain: ${word}`
        });
      });
    }
    
    return flashcards;
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const generatedFlashcards = textInput.trim() 
        ? generateFlashcardsFromText(textInput)
        : [];

      if (generatedFlashcards.length === 0) {
        throw new Error('No flashcards could be generated from the provided content');
      }

      addFlashcardSet({
        name: setName,
        cards: generatedFlashcards,
        priority: 'medium',
        isRead: false
      });

      toast({
        title: "Flashcards Generated!",
        description: `Successfully created ${generatedFlashcards.length} flashcards for "${setName}".`,
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

                <div className="flex items-center justify-center">
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm rounded-full">
                    OR
                  </span>
                </div>

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
                  />
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
