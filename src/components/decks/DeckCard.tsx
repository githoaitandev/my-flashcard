import { Deck } from "@/lib/types";
import Link from "next/link";

interface DeckCardProps {
  deck: Deck & {
    count?: {
      cards: number;
    };
  };
}

export default function DeckCard({ deck }: DeckCardProps) {
  const cardCount = deck.count?.cards || 0;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900 truncate">
            {deck.name}
          </h3>
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
            {cardCount} cards
          </span>
        </div>

        {deck.description && (
          <p className="text-gray-600 mb-4 line-clamp-2">{deck.description}</p>
        )}

        <div className="mt-4 flex space-x-2">
          <Link
            href={`/decks?id=${deck.id}`}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            View
          </Link>
          <Link
            href={`/study?deckId=${deck.id}`}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Study
          </Link>
        </div>
      </div>
    </div>
  );
}
