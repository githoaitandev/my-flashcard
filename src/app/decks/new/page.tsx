"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import DeckForm from "@/components/decks/DeckForm";
import { DeckCreate } from "@/lib/types";
import baseUrl from "@/utils/baseUrl";

export default function NewDeckPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateDeck = async (data: DeckCreate) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${baseUrl}/api/decks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create deck");
      }

      const result = await response.json();

      // Navigate to the new deck's page
      router.push(`/decks/${result.data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error creating deck:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <PageHeader
        title="Create New Deck"
        description="Create a new deck to organize your vocabulary flashcards"
      />

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
          <p>{error}</p>
        </div>
      )}

      <DeckForm onSubmit={handleCreateDeck} isLoading={isLoading} />
    </div>
  );
}
