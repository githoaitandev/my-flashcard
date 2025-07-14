import { Flashcard } from "@/lib/types";

export interface DeckWithDetails {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  isPublic: boolean;
  cards: Flashcard[];
  count: {
    count: number;
  }[];
}
