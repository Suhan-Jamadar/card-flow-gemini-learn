
export interface Flashcard {
  question: string;
  answer: string;
  isRead: boolean; // Make this required, not optional
}

export interface FlashcardSet {
  id: string;
  name: string;
  cards: Flashcard[];
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: string;
}
