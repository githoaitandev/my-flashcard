"use client";

import { useState, useEffect } from "react";
import { Flashcard, memoryStatusLabels } from "@/lib/types";
import Link from "next/link";

interface FlashcardSliderProps {
  cards: Flashcard[];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onUpdate?: (cardId: string, memoryStatus: number) => Promise<void>;
}

export default function FlashcardSlider({
  cards,
  currentIndex,
  onNext,
  onPrev,
  onUpdate,
}: FlashcardSliderProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [animDirection, setAnimDirection] = useState<"left" | "right" | null>(
    null
  );

  // Reset flip state when the card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const updateMemoryStatus = async (status: number) => {
    if (onUpdate && cards[currentIndex]) {
      setIsUpdating(true);
      await onUpdate(cards[currentIndex].id, status);
      setIsUpdating(false);
      setIsFlipped(false); // Reset to front of card
    }
  };

  const handlePrev = () => {
    setAnimDirection("right");
    setTimeout(() => {
      onPrev();
      setAnimDirection(null);
    }, 300);
  };

  const handleNext = () => {
    setAnimDirection("left");
    setTimeout(() => {
      onNext();
      setAnimDirection(null);
    }, 300);
  };

  if (!cards.length || currentIndex >= cards.length) {
    return (
      <div className="w-full max-w-lg mx-auto bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-600">No cards available for study.</p>
      </div>
    );
  }

  const card = cards[currentIndex];

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="relative overflow-hidden bg-gray-50 p-4 rounded-lg shadow-xs">
        <div
          className={`transform transition-transform duration-500 ease-in-out ${
            animDirection === "left"
              ? "-translate-x-full"
              : animDirection === "right"
              ? "translate-x-full"
              : "translate-x-0"
          }`}
        >
          <div
            className="w-full bg-white rounded-lg shadow-md cursor-pointer p-6"
            onClick={handleFlip}
          >
            {!isFlipped ? (
              // Front side
              <div className="h-64 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                      {card.partOfSpeech}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/flashcards/${card.id}`}
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        className="text-xs text-blue-500 hover:text-blue-700"
                      >
                        Edit
                      </Link>
                      <span className="text-xs text-gray-500">
                        {memoryStatusLabels[card.memoryStatus]}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">
                    {card.englishWord}
                  </h3>
                </div>
                <div className="text-center text-sm text-gray-500">
                  Click to reveal meaning
                </div>
              </div>
            ) : (
              // Back side
              <div className="h-64 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                      {card.partOfSpeech}
                    </span>
                    <span className="text-xs text-gray-500">
                      {memoryStatusLabels[card.memoryStatus]}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">
                    {card.vietnameseWord}
                  </h3>
                  {card.example && (
                    <div className="mt-4">
                      <p className="italic text-gray-600 text-center break-words">
                        &quot;{card.example}&quot;
                      </p>
                    </div>
                  )}
                </div>
                {onUpdate && (
                  <div className="flex justify-center gap-2 mt-6">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateMemoryStatus(Math.max(0, card.memoryStatus - 1));
                      }}
                      disabled={isUpdating || card.memoryStatus === 0}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                    >
                      Don&apos;t Know
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateMemoryStatus(Math.min(3, card.memoryStatus + 1));
                      }}
                      disabled={isUpdating || card.memoryStatus === 3}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                    >
                      Know It
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation controls */}
      <div className="flex justify-between mt-4 px-2">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-l disabled:opacity-50"
        >
          &larr; Previous
        </button>
        <div className="flex items-center text-sm text-gray-600">
          Card {currentIndex + 1} of {cards.length}
        </div>
        <button
          onClick={handleNext}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-r"
        >
          {currentIndex === cards.length - 1 ? "Finish" : "Next →"}
        </button>
      </div>
    </div>
  );
}
