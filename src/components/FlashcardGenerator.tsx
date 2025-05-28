
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const { addFlashcardSet } = useFlashcards();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      // Clear text input when file is uploaded
      setTextInput('');
      
      toast({
        title: "File Uploaded",
        description: `${uploadedFile.name} is ready for processing.`,
      });
    }
  };

  const generateFlashcardsWithGemini = async (content: string) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your environment variables.');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Create flashcards from the following content. Generate 5-10 flashcards with clear questions and concise answers. Format the response as a JSON array with objects containing "question" and "answer" fields. Content: ${content}`
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No content generated from Gemini API');
    }

    // Extract JSON from the response
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      // Fallback: parse the text manually
      const lines = generatedText.split('\n').filter(line => line.trim());
      const flashcards = [];
      
      for (let i = 0; i < lines.length - 1; i += 2) {
        if (lines[i] && lines[i + 1]) {
          flashcards.push({
            question: lines[i].replace(/^\d+\.\s*/, '').trim(),
            answer: lines[i + 1].trim()
          });
        }
      }
      
      return flashcards;
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
      reader.readAsText(file);
    });
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
      let content = textInput.trim();
      
      // If file is uploaded, extract text from it
      if (file) {
        content = await extractTextFromFile(file);
      }

      if (!content) {
        throw new Error('No content to process');
      }

      // Generate flashcards using Gemini API
      const generatedFlashcards = await generateFlashcardsWithGemini(content);

      if (!generatedFlashcards || generatedFlashcards.length === 0) {
        throw new Error('No flashcards could be generated from the provided content');
      }

      addFlashcardSet({
        name: setName,
        cards: generatedFlashcards,
        priority: priority,
        isRead: false
      });

      toast({
        title: "Flashcards Generated!",
        description: `Successfully created ${generatedFlashcards.length} flashcards for "${setName}".`,
      });

      onClose();
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate flashcards. Please try again.",
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
                Priority Level
              </Label>
              <RadioGroup value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low" className="text-sm text-green-600 dark:text-green-400">Low Priority</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="text-sm text-yellow-600 dark:text-yellow-400">Medium Priority</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high" className="text-sm text-red-600 dark:text-red-400">High Priority</Label>
                </div>
              </RadioGroup>
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
                      <Button
                        onClick={() => setFile(null)}
                        variant="ghost"
                        size="sm"
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>

                {!file && (
                  <>
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
                  </>
                )}
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
