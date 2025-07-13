"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import DeckCard from "@/components/decks/DeckCard";
import { DeckWithDetails } from "@/utils/client-types";
import { useRouter } from "next/navigation";

// Loading skeleton component
const DecksSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array(6)
      .fill(0)
      .map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md p-6 animate-pulse"
        >
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="flex justify-between">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      ))}
  </div>
);

// Empty state component
const EmptyState = () => (
  <div className="bg-white rounded-lg shadow-md p-8 text-center">
    <h3 className="text-lg font-medium text-gray-900 mb-2">No decks yet</h3>
    <p className="text-gray-600 mb-4">
      Create your first deck to start adding flashcards.
    </p>
    <Link
      href="/decks/new"
      className="inline-block px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
    >
      Create your first deck
    </Link>
  </div>
);

// Main deck list component
const DeckList = ({ decks }: { decks: DeckWithDetails[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {decks.map((deck: DeckWithDetails) => (
      <DeckCard key={deck.id} deck={deck} />
    ))}
  </div>
);

export default function DecksPage() {
  const [decks, setDecks] = useState<DeckWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchDecks = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/decks");

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch decks");
    }

    const data = await response.json();
    setDecks(data.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDecks().catch((err) => {
      console.error("Error fetching decks:", err);
      throw err; // Propagate error to trigger error boundary
    });
  }, [fetchDecks]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <PageHeader
          title="Your Decks"
          description="Manage your vocabulary decks"
        />
        <div className="flex-shrink-0">
          <Link
            href="/decks/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Create Deck
          </Link>
        </div>
      </div>

      <Suspense fallback={<DecksSkeleton />}>
        {loading ? (
          <DecksSkeleton />
        ) : decks.length > 0 ? (
          <DeckList decks={decks} />
        ) : (
          <EmptyState />
        )}
      </Suspense>
    </div>
  );
}
