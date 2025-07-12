"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import FlashcardSlider from "@/components/cards/FlashcardSlider";
import Link from "next/link";
import { Flashcard } from "@/lib/types";
import baseUrl from "@/utils/baseUrl";

export default function StudyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deckId = searchParams.get("deckId");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [deckName, setDeckName] = useState<string>("");
  const [studySessionId, setStudySessionId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    mastered: 0,
    current: 0,
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

  // Load cards for studying
  useEffect(() => {
    const fetchCards = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const cardsUrl = new URL("/api/study", baseUrl);
        if (selectedDeckId) {
          cardsUrl.searchParams.append("deckId", selectedDeckId);
        }
        cardsUrl.searchParams.append("limit", "20"); // Fetch up to 20 cards

        const cardsResponse = await fetch(cardsUrl.toString());

        if (!cardsResponse.ok) {
          throw new Error("Failed to fetch study cards");
        }

        const cardsData = await cardsResponse.json();
        setCards(cardsData.data);

        // If we have a deckId, also fetch the deck name
        if (deckId) {
          const deckResponse = await fetch(
            `${baseUrl}/api/decks/?id=${deckId}`
          );
          if (deckResponse.ok) {
            const deckData = await deckResponse.json();
            setDeckName(deckData.data.name);
          }
        }

        // Create a study session
        if (cardsData.data.length > 0) {
          const sessionResponse = await fetch(`${baseUrl}/api/study`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              cardCount: cardsData.data.length,
              deckId: deckId || null,
            }),
          });

          if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();
            setStudySessionId(sessionData.data.id);
          }
        }

        // Update stats
        setStats({
          total: cardsData.data.length,
          mastered: 0,
          current: 1,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching study cards:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCards();
  }, [selectedDeckId]);

  const handleUpdateCard = async (cardId: string, memoryStatus: number) => {
    try {
      // Update card status
      const response = await fetch(`${baseUrl}/api/flashcards/${cardId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memoryStatus,
          lastReviewed: new Date(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update card status");
      }

      // Update local state if needed
      const updatedCards = [...cards];
      const cardIndex = updatedCards.findIndex((c) => c.id === cardId);
      if (cardIndex !== -1) {
        updatedCards[cardIndex] = {
          ...updatedCards[cardIndex],
          memoryStatus,
          lastReviewed: new Date().toISOString(),
        };
      }

      // Go to next card
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setStats((prev) => ({
          ...prev,
          current: prev.current + 1,
          mastered: memoryStatus === 3 ? prev.mastered + 1 : prev.mastered,
        }));
      } else {
        // End of study session
        if (studySessionId) {
          await fetch(`${baseUrl}/api/study/${studySessionId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              endedAt: new Date(),
              correctCount: updatedCards.filter((c) => c.memoryStatus >= 2)
                .length,
            }),
          });
        }

        setIsCompleted(true);
      }
    } catch (error) {
      console.error("Error updating card:", error);
    }
  };

  const resetStudy = () => {
    setCurrentIndex(0);
    setIsCompleted(false);
    setStats({
      total: cards.length,
      mastered: 0,
      current: 1,
    });
  };

  const getPageTitle = () => {
    if (deckName) {
      return `Study: ${deckName}`;
    }
    return "Study Flashcards";
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
        <PageHeader title="Error" description="Could not load study session" />
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">{error}</p>
        </div>
        <div className="mt-6">
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // No cards to study
  if (cards.length === 0) {
    return (
      <div className="max-w-xl mx-auto">
        <PageHeader
          title={getPageTitle()}
          description="No cards available for study right now"
        />
        <div className="bg-white rounded-lg p-8 shadow-md text-center">
          <p className="text-gray-600 mb-4">
            You don't have any cards to study at this time.
            <br />
            Please add flashcards to your deck to start studying.
          </p>
          <div className="flex justify-center mt-6">
            <Link
              href={deckId ? `/decks/${deckId}` : "/decks"}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Go to Deck Detail
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Study completed
  if (isCompleted) {
    return (
      <div className="max-w-xl mx-auto">
        <PageHeader
          title="Study Complete"
          description="Great job! You've completed this study session"
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
              <div className="text-sm text-gray-500">Cards Studied</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">
                {stats.mastered}
              </div>
              <div className="text-sm text-gray-500">Mastered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">
                {Math.round((stats.mastered / cards.length) * 100)}%
              </div>
              <div className="text-sm text-gray-500">Success Rate</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={resetStudy}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Study Again
            </button>
            <Link
              href="/"
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-center"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active study session
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <PageHeader
          title={getPageTitle()}
          description="Review your flashcards"
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
        <FlashcardSlider
          cards={cards}
          currentIndex={currentIndex}
          onNext={() => {
            if (currentIndex < cards.length - 1) {
              setCurrentIndex(currentIndex + 1);
              setStats((prev) => ({
                ...prev,
                current: prev.current + 1,
              }));
            }
          }}
          onPrev={() => {
            if (currentIndex > 0) {
              setCurrentIndex(currentIndex - 1);
              setStats((prev) => ({
                ...prev,
                current: prev.current - 1,
              }));
            }
          }}
          onUpdate={handleUpdateCard}
        />
      </div>

      <div className="flex justify-center mt-10">
        <Link
          href={deckId ? `/decks/${deckId}` : "/decks"}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {deckId ? "Go to Deck Detail" : "View All Decks"}
        </Link>
      </div>
    </div>
  );
}
