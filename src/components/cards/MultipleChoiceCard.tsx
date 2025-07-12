"use client";

import { useState, useEffect, useRef } from "react";
import { Flashcard } from "@/lib/types";

interface MultipleChoiceCardProps {
  card: Flashcard;
  allCards: Flashcard[];
  onResult: (isCorrect: boolean) => void;
}

export default function MultipleChoiceCard({
  card,
  allCards,
  onResult,
}: MultipleChoiceCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [options, setOptions] = useState<any[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [shouldMoveNext, setShouldMoveNext] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const prevCardId = useRef<string | null>(null);

  // Generate options only when card changes
  useEffect(() => {
    const generateOptions = () => {
      const options = [];

      // Add the correct answer
      options.push({
        id: card.id,
        text: card.englishWord,
        isCorrect: true,
      });

      // Get random wrong answers from other cards
      const shuffledCards = [...allCards].sort(() => 0.5 - Math.random());

      // Try to get answers with the same part of speech first
      const samePartOfSpeech = shuffledCards.filter(
        (c) => c.partOfSpeech === card.partOfSpeech && c.id !== card.id
      );

      let wrongAnswers = [];
      if (samePartOfSpeech.length >= 3) {
        wrongAnswers = samePartOfSpeech.slice(0, 3);
      } else {
        // If not enough cards with same part of speech, add other cards
        const otherCards = shuffledCards.filter(
          (c) => c.partOfSpeech !== card.partOfSpeech
        );
        wrongAnswers = [
          ...samePartOfSpeech,
          ...otherCards.slice(0, 3 - samePartOfSpeech.length),
        ];
      }

      // Add wrong answers
      wrongAnswers.forEach((wrongCard) => {
        options.push({
          id: wrongCard.id,
          text: wrongCard.englishWord,
          isCorrect: false,
        });
      });

      // Shuffle the options
      return options.sort(() => 0.5 - Math.random());
    };
    setOptions(generateOptions());
    setSelectedOption(null);
    setIsChecked(false);
    setIsCorrect(false);
    setCountdown(null);
    prevCardId.current = card.id;
  }, [card.id, allCards]);

  const handleOptionSelect = (optionId: string) => {
    if (!isChecked) {
      setSelectedOption(optionId);
    }
  };

  const checkAnswer = () => {
    if (selectedOption) {
      const selectedOptionData = options.find(
        (option) => option.id === selectedOption
      );
      const result = selectedOptionData?.isCorrect || false;
      setIsCorrect(result);
      setIsChecked(true);
      setCountdown(5);
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(timerRef.current!);
            timerRef.current = null;
            setCountdown(null);
            setShouldMoveNext(true); // Đánh dấu sẽ chuyển card
            return null;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);
    }
  };

  // Cleanup timer on card change or unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [card.id]);

  // useEffect để gọi onResult khi cần
  useEffect(() => {
    if (shouldMoveNext) {
      onResult(isCorrect);
      setSelectedOption(null);
      setIsChecked(false);
      setShouldMoveNext(false);
    }
  }, [shouldMoveNext, isCorrect, onResult]);

  const handleNextQuestion = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCountdown(null);
    onResult(isCorrect);
    setSelectedOption(null);
    setIsChecked(false);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4 flex justify-between items-center">
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
          {card.partOfSpeech}
        </span>
      </div>

      <div className="mb-6 min-h-[100px]">
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
                minHeight: "3rem",
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

      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Choose the correct English word:
        </h4>
        <div className="space-y-3">
          {options.map((option) => (
            <div
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              className={`p-3 border rounded-md cursor-pointer transition ${
                !isChecked
                  ? selectedOption === option.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-300"
                  : option.isCorrect
                  ? "border-green-500 bg-green-50"
                  : selectedOption === option.id && !option.isCorrect
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300 opacity-70"
              }`}
            >
              <div className="flex justify-between">
                <span>{option.text}</span>
                {isChecked && (
                  <span>
                    {option.isCorrect ? (
                      <svg
                        className="w-5 h-5 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    ) : selectedOption === option.id ? (
                      <svg
                        className="w-5 h-5 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    ) : null}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {!isChecked ? (
        <button
          onClick={checkAnswer}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={!selectedOption}
        >
          Check Answer
        </button>
      ) : (
        <>
          <div
            className={`p-4 rounded-md ${
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
            {countdown !== null && (
              <div className="mt-4 text-center text-sm text-gray-500">
                Moving to next card in{" "}
                <span className="font-bold">{countdown}</span> seconds...
              </div>
            )}
          </div>
          <button
            onClick={handleNextQuestion}
            className="w-full mt-4 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Next Question
          </button>
        </>
      )}
    </div>
  );
}
