
export interface Flashcard {
  question: string;
  answer: string;
}

export interface FlashcardSet {
  id: string;
  name: string;
  cards: Flashcard[];
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: string;
}
