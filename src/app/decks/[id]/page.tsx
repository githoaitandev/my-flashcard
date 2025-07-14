"use client";
import { Suspense } from "react";
import { useParams } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import FlashcardList from "@/components/cards/FlashcardList";
import ImportExport from "@/components/decks/ImportExport";
import AddFlashcard from "@/components/cards/AddFlashcard";
import baseUrl from "@/utils/baseUrl";
import DeckActions from "@/components/decks/DeckActions";
import { Flashcard } from "@/lib/types";
import { DeckWithDetails } from "@/utils/client-types";
import useSWR from "swr";

const deckFetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to fetch data");
  }
  const responseData = await res.json();
  return responseData.data as DeckWithDetails;
};

export default function DeckPage() {
  const { id } = useParams();
  const { data: deck, error } = useSWR(
    `${baseUrl}/api/decks?id=${id}`,
    deckFetcher,
    {
      suspense: true,
    }
  );
  if (error) {
    return (
      <div className="bg-red-100 rounded-lg shadow-md p-8 text-center">
        <h3 className="text-lg font-medium text-red-900 mb-2">Error</h3>
        <p className="text-red-600 mb-4">{error.message}</p>
      </div>
    );
  }

  if (!deck) {
    return <div>Loading...</div>;
  }
  // Organize cards by memory status
  const newCards = deck.cards.filter(
    (card: Flashcard) => card.memoryStatus === 0
  );
  const learningCards = deck.cards.filter(
    (card: Flashcard) => card.memoryStatus === 1
  );
  const reviewCards = deck.cards.filter(
    (card: Flashcard) => card.memoryStatus === 2
  );
  const masteredCards = deck.cards.filter(
    (card: Flashcard) => card.memoryStatus === 3
  );

  return (
    <Suspense fallback={<div>Loading deck...</div>}>
      <div>
        <div className="flex justify-between items-start mb-8">
          <PageHeader title={deck.name} description={deck.description || ""} />
          <div className="flex space-x-2">
            <DeckActions deck={deck} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {deck.count[0].count}
                </div>
                <div className="text-sm text-gray-500">Total Cards</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow text-center">
                <div className="text-3xl font-bold text-yellow-500">
                  {newCards.length}
                </div>
                <div className="text-sm text-gray-500">New</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow text-center">
                <div className="text-3xl font-bold text-orange-500">
                  {learningCards.length + reviewCards.length}
                </div>
                <div className="text-sm text-gray-500">Learning</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow text-center">
                <div className="text-3xl font-bold text-green-500">
                  {masteredCards.length}
                </div>
                <div className="text-sm text-gray-500">Mastered</div>
              </div>
            </div>

            <FlashcardList flashcards={deck.cards} deckId={deck.id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <AddFlashcard deckId={deck.id} deckName={deck.name} />
            <ImportExport deckId={deck.id} deckName={deck.name} />
          </div>
        </div>
      </div>
    </Suspense>
  );
}
