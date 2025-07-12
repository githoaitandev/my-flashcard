"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import Link from "next/link";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PracticePageContent />
    </Suspense>
  );
}

function PracticePageContent() {
  const searchParams = useSearchParams();
  const deckId = searchParams.get("deckId");

  const practiceOptions = [
    {
      id: "writing",
      title: "Writing Practice",
      description:
        "Practice writing the English words from their Vietnamese meanings",
      icon: (
        <svg
          className="w-10 h-10 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          ></path>
        </svg>
      ),
    },
    {
      id: "choice-test",
      title: "Multiple Choice",
      description: "Test your knowledge with multiple choice questions",
      icon: (
        <svg
          className="w-10 h-10 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Practice Modes"
        description="Choose a practice mode to improve your vocabulary skills"
      />

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        {practiceOptions.map((option) => (
          <Link
            key={option.id}
            href={
              deckId
                ? `/practice/${option.id}?deckId=${deckId}`
                : `/practice/${option.id}`
            }
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col items-center"
          >
            <div className="mb-4">{option.icon}</div>
            <h3 className="text-xl font-bold mb-2">{option.title}</h3>
            <p className="text-gray-600 text-center">{option.description}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/decks"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Decks
        </Link>
      </div>
    </div>
  );
}
