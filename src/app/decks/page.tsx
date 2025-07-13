import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import DeckCard from "@/components/decks/DeckCard";
import { Deck } from "@/lib/types";
import baseUrl from "@/utils/baseUrl";

async function fetchDecks() {
  const decksRes = await fetch(`${baseUrl}/api/decks`, { cache: "no-store" });
  if (!decksRes.ok) {
    throw new Error("Failed to fetch decks");
  }
  const decksJson = await decksRes.json();
  console.log("Fetched decks:", decksJson);
  return decksJson.data || [];
}
export default async function DecksPage() {
  // Fetch all decks via API

  const decks = await fetchDecks();

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

      {decks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck: Deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No decks yet
          </h3>
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
      )}
    </div>
  );
}
