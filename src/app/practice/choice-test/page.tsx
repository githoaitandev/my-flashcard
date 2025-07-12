"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/layout/PageHeader";
import Link from "next/link";
import { Flashcard } from "@/lib/types";
import baseUrl from "@/utils/baseUrl";
import MultipleChoiceCard from "@/components/cards/MultipleChoiceCard";

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [allCards, setAllCards] = useState<Flashcard[]>([]); // For generating options
  const [currentIndex, setCurrentIndex] = useState(0);
  const [deckName, setDeckName] = useState<string>("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    correct: 0,
    current: 1,
  });
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [decks, setDecks] = useState<{ id: string; name: string }[]>([]);

  // Load decks for selection
  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/decks`);
        if (!response.ok) {
          throw new Error("Failed to fetch decks");
        }
        const data = await response.json();
        setDecks(data.data);
      } catch (error) {
        console.error("Error fetching decks:", error);
      }
    };

    fetchDecks();
  }, []);

  const handleDeckChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDeckId(event.target.value || null);
  };

  // Load all cards for options
  useEffect(() => {
    const fetchAllCards = async () => {
      try {
        // Fetch all cards (limited to 100 for practical reasons)
        const allCardsUrl = new URL("/api/flashcards", baseUrl);
        allCardsUrl.searchParams.append("limit", "100");

        const response = await fetch(allCardsUrl.toString());
        if (!response.ok) {
          throw new Error("Failed to fetch all cards");
        }

        const data = await response.json();
        setAllCards(data.data);
      } catch (error) {
        console.error("Error fetching all cards:", error);
      }
    };

    fetchAllCards();
  }, []);

  // Load cards for practicing
  useEffect(() => {
    const fetchCards = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const cardsUrl = new URL("/api/study", baseUrl);
        if (selectedDeckId) {
          cardsUrl.searchParams.append("deckId", selectedDeckId);
        }
        cardsUrl.searchParams.append("limit", "10"); // Fetch up to 10 cards for practice

        const response = await fetch(cardsUrl.toString());
        if (!response.ok) {
          throw new Error("Failed to fetch practice cards");
        }

        const data = await response.json();
        setCards(data.data);

        // If we have a deckId, also fetch the deck name
        if (selectedDeckId) {
          const deckResponse = await fetch(
            `${baseUrl}/api/decks?id=${selectedDeckId}`
          );
          if (deckResponse.ok) {
            const deckData = await deckResponse.json();
            setDeckName(deckData.data.name);
          }
        }

        // Update stats
        setStats({
          total: data.data.length,
          correct: 0,
          current: 1,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching practice cards:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCards();
  }, [selectedDeckId]);

  const handleCardResult = (isCorrect: boolean) => {
    // Update stats
    setStats((prev) => ({
      ...prev,
      correct: isCorrect ? prev.correct + 1 : prev.correct,
    }));

    // Go to next card
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setStats((prev) => ({
        ...prev,
        current: prev.current + 1,
      }));
    } else {
      // End of practice session
      setIsCompleted(true);
    }
  };

  const resetPractice = () => {
    setCurrentIndex(0);
    setIsCompleted(false);
    setStats({
      total: cards.length,
      correct: 0,
      current: 1,
    });
  };

  const getPageTitle = () => {
    if (deckName) {
      return `Multiple Choice: ${deckName}`;
    }
    return "Multiple Choice Test";
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
          <div className="h-2.5 bg-gray-200 rounded-full w-full mb-4 animate-pulse"></div>
          <div className="h-2.5 bg-blue-200 rounded-full w-1/2 mb-4 animate-pulse"></div>
        </div>

        <div className="mb-8">
          <div className="h-64 bg-gray-200 rounded-lg shadow-md animate-pulse"></div>
        </div>

        <div className="flex justify-end">
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-xl mx-auto">
        <PageHeader
          title="Error"
          description="Could not load practice session"
        />
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">{error}</p>
        </div>
        <div className="mt-6">
          <Link
            href="/practice"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Practice
          </Link>
        </div>
      </div>
    );
  }

  // No cards to practice
  if (cards.length === 0) {
    return (
      <div className="max-w-xl mx-auto">
        <PageHeader
          title={getPageTitle()}
          description="No cards available for practice right now"
        />
        <div className="bg-white rounded-lg p-8 shadow-md text-center">
          <p className="text-gray-600 mb-4">
            You don&apos;t have any cards to practice at this time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <Link
              href="/decks"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
            >
              Manage Decks
            </Link>
            <Link
              href="/practice"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-center"
            >
              Back to Practice
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Practice completed
  if (isCompleted) {
    return (
      <div className="max-w-xl mx-auto">
        <PageHeader
          title="Practice Complete"
          description="Great job! You've completed this multiple choice session"
        />
        <div className="bg-white rounded-lg p-8 shadow-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-500 mb-4">
              <svg
                className="h-10 w-10"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900">
              Session Summary
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">
                {cards.length}
              </div>
              <div className="text-sm text-gray-500">Cards Practiced</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">
                {stats.correct}
              </div>
              <div className="text-sm text-gray-500">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round((stats.correct / cards.length) * 100)}%
              </div>
              <div className="text-sm text-gray-500">Accuracy</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={resetPractice}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Practice Again
            </button>
            <Link
              href="/practice"
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-center"
            >
              Back to Practice
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active practice session
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <PageHeader
          title={getPageTitle()}
          description="Choose the correct answer for each question"
        />

        <div className="mb-4">
          <label
            htmlFor="deck-select"
            className="block text-sm font-medium text-gray-700"
          >
            Select Deck:
          </label>
          <select
            id="deck-select"
            value={selectedDeckId || ""}
            onChange={handleDeckChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">All Decks</option>
            {decks.map((deck) => (
              <option key={deck.id} value={deck.id}>
                {deck.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${(currentIndex / cards.length) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>
            Card {stats.current} of {stats.total}
          </span>
          <span>
            {Math.round((currentIndex / cards.length) * 100)}% complete
          </span>
        </div>
      </div>

      <div className="mb-8">
        {cards.length > 0 && allCards.length > 0 && (
          <MultipleChoiceCard
            card={cards[currentIndex]}
            allCards={allCards.filter((c) => c.id !== cards[currentIndex].id)}
            onResult={handleCardResult}
          />
        )}
      </div>
    </div>
  );
}
