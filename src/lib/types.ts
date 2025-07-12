// Deck Types
export interface Deck {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  count?: {
    cards: number;
  };
}

export interface DeckWithCards extends Deck {
  cards: Flashcard[];
}

export interface DeckCreate {
  name: string;
  description: string;
}

// Flashcard Types
export interface Flashcard {
  id: string;
  englishWord: string;
  vietnameseWord: string;
  partOfSpeech: PartOfSpeech;
  example: string | null;
  memoryStatus: number;
  deckId: string;
  lastReviewed: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FlashcardCreate {
  englishWord: string;
  vietnameseWord: string;
  partOfSpeech: PartOfSpeech;
  example: string;
  deckId: string;
}

// Study Session Types
export interface StudySession {
  id: string;
  deckId: string | null;
  cardCount: number;
  correctCount: number;
  startedAt: string;
  endedAt: string | null;
  createdAt: string;
}

export interface StudySessionCreate {
  deckId?: string;
  cardCount: number;
}

// Enums as types
export type PartOfSpeech =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "preposition"
  | "conjunction"
  | "pronoun"
  | "interjection"
  | "other";

// Constants
export const memoryStatusLabels = ["New", "Learning", "Familiar", "Mastered"];

export const partsOfSpeech: PartOfSpeech[] = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "preposition",
  "conjunction",
  "pronoun",
  "interjection",
  "other",
];
