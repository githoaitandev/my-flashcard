import { notFound } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import FlashcardList from "@/components/cards/FlashcardList";
import ImportExport from "@/components/decks/ImportExport";
import AddFlashcard from "@/components/cards/AddFlashcard";
import baseUrl from "@/utils/baseUrl";
import DeckActions from "@/components/decks/DeckActions";
import { Flashcard } from "@/lib/types";

export default async function DeckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const deck = await fetch(`${baseUrl}/api/decks?id=${id}`)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to fetch deck");
      }
      return res.json();
    })
    .then((data) => data.data);

  if (!deck) {
    notFound();
  }

  // Organize cards by memory status
  const newCards = deck.cards.filter(
    (card: Flashcard) => card.memoryStatus === 0
  );
  const learningCards = deck.cards.filter(
    (card: Flashcard) => card.memoryStatus === 1
  );
  const reviewCards = deck.cards.filter(
    (card: Flashcard) => card.memoryStatus === 2
  );
  const masteredCards = deck.cards.filter(
    (card: Flashcard) => card.memoryStatus === 3
  );
  console.log("Deck:", deck);
  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <PageHeader title={deck.name} description={deck.description || ""} />
        <div className="flex space-x-2">
          <DeckActions deck={deck} />
          {/* <Link
            href={`/study?deckId=${deck.id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Study Deck
          </Link>
          <Link
            href={`/practice?deckId=${deck.id}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Practice Writing
          </Link> */}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="text-3xl font-bold text-blue-600">
                {deck.count[0].count}
              </div>
              <div className="text-sm text-gray-500">Total Cards</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="text-3xl font-bold text-yellow-500">
                {newCards.length}
              </div>
              <div className="text-sm text-gray-500">New</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="text-3xl font-bold text-orange-500">
                {learningCards.length + reviewCards.length}
              </div>
              <div className="text-sm text-gray-500">Learning</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="text-3xl font-bold text-green-500">
                {masteredCards.length}
              </div>
              <div className="text-sm text-gray-500">Mastered</div>
            </div>
          </div>

          <FlashcardList flashcards={deck.cards} deckId={deck.id} />
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <AddFlashcard deckId={deck.id} deckName={deck.name} />
          <ImportExport deckId={deck.id} deckName={deck.name} />
        </div>
      </div>
    </div>
  );
}
