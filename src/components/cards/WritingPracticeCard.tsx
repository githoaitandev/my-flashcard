"use client";

import { Flashcard } from "@/lib/types";
import { useState } from "react";

interface WritingPracticeCardProps {
  card: Flashcard;
  onResult: (isCorrect: boolean) => void;
}

export default function WritingPracticeCard({
  card,
  onResult,
}: WritingPracticeCardProps) {
  const [userInput, setUserInput] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const checkAnswer = () => {
    // Case insensitive comparison
    const normalizedUserInput = userInput.trim().toLowerCase();
    const normalizedAnswer = card.englishWord.trim().toLowerCase();

    const result = normalizedUserInput === normalizedAnswer;
    setIsCorrect(result);
    setShowResult(true);
    onResult(result);
  };

  const resetCard = () => {
    setUserInput("");
    setShowResult(false);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4">
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
          {card.partOfSpeech}
        </span>
      </div>

      <div id="card-info" className="mb-6" style={{ minHeight: "150px" }}>
        <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">
          {card.vietnameseWord}
        </h3>
        {card.example && (
          <div className="mt-4">
            <p
              className="italic text-gray-600"
              style={{
                whiteSpace: "normal",
                wordWrap: "break-word",
                lineHeight: "1.5rem",
              }}
            >
              "
              {card.example.replace(
                new RegExp(`\\b${card.englishWord}\\b`, "i"),
                "_______"
              )}
              "
            </p>
          </div>
        )}
      </div>

      {!showResult ? (
        <div>
          <div className="mb-4">
            <label
              htmlFor="answer"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Type the English word:
            </label>
            <input
              type="text"
              id="answer"
              value={userInput}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Type your answer..."
            />
          </div>

          <button
            onClick={checkAnswer}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={!userInput.trim()}
          >
            Check Answer
          </button>
        </div>
      ) : (
        <div>
          <div
            className={`p-4 mb-4 rounded-md ${
              isCorrect ? "bg-green-100" : "bg-red-100"
            }`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                {isCorrect ? (
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p
                  className={`text-sm font-medium ${
                    isCorrect ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {isCorrect ? "Correct!" : "Incorrect"}
                </p>
                {!isCorrect && (
                  <p className="text-sm text-red-700 mt-1">
                    The correct answer is:{" "}
                    <span className="font-bold">{card.englishWord}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={resetCard}
            className="w-full py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
