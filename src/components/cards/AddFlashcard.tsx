"use client";

import { useState } from "react";
import FlashcardForm from "./FlashcardForm";
import { FlashcardCreate } from "@/lib/types";
import baseUrl from "@/utils/baseUrl";
import { mutate } from "swr";

interface AddFlashcardProps {
  deckId: string;
  deckName: string;
}

export default function AddFlashcard({ deckId, deckName }: AddFlashcardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddFlashcard = async (data: FlashcardCreate) => {
    try {
      setIsAdding(true);
      setError(null);

      const response = await fetch(`${baseUrl}/api/flashcards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add flashcard");
      }

      mutate(`${baseUrl}/api/decks?id=${deckId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error adding flashcard:", err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Add Flashcard to &quot;{deckName}&quot;
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm">
          <p>{error}</p>
        </div>
      )}

      <FlashcardForm
        onSubmit={handleAddFlashcard}
        deckId={deckId}
        isLoading={isAdding}
      />
    </div>
  );
}
