"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Flashcard } from "@/lib/types";
import baseUrl from "@/utils/baseUrl";

interface FlashcardListProps {
  flashcards: Flashcard[];
  deckId: string;
}

export default function FlashcardList({ flashcards }: FlashcardListProps) {
  const router = useRouter();
  const [cards, setCards] = useState<Flashcard[]>(flashcards);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Update cards when prop changes
  useEffect(() => {
    setCards(flashcards);
  }, [flashcards]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this flashcard?")) {
      try {
        setIsDeleting(id);
        const response = await fetch(`${baseUrl}/api/flashcards?id=${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete flashcard");
        }

        // Update local state
        setCards(cards.filter((card) => card.id !== id));

        // Refresh the page to update the counts
        router.refresh();
      } catch (error) {
        console.error("Error deleting flashcard:", error);
        alert("Failed to delete flashcard");
      } finally {
        setIsDeleting(null);
      }
    }
  };

  if (cards.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No flashcards in this deck
        </h3>
        <p className="text-gray-600 mb-4">
          Start adding flashcards to begin studying.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Flashcards ({cards.length})
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                English Word
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Vietnamese
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Part of Speech
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cards.map((card) => (
              <tr key={card.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {card.englishWord}
                  </div>
                  {card.example && (
                    <div className="text-xs text-gray-500 mt-1 italic truncate max-w-3xs">
                      &quot;{card.example}&quot;
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {card.vietnameseWord}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {card.partOfSpeech}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      card.memoryStatus === 0
                        ? "bg-yellow-100 text-yellow-800"
                        : card.memoryStatus === 1
                        ? "bg-orange-100 text-orange-800"
                        : card.memoryStatus === 2
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {card.memoryStatus === 0
                      ? "New"
                      : card.memoryStatus === 1
                      ? "Learning"
                      : card.memoryStatus === 2
                      ? "Review"
                      : "Mastered"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link
                    href={`/flashcards/${card.id}`}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(card.id)}
                    disabled={isDeleting === card.id}
                    className={`text-red-600 hover:text-red-900 ${
                      isDeleting === card.id
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {isDeleting === card.id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
