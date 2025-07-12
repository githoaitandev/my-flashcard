import { successResponse, errorResponse } from "@/lib/api-utils";
import { createClient } from "@/lib/supabase/serverClient";
import { NextRequest } from "next/server";

// Export handler
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }
    const { searchParams } = new URL(request.url);
    const deckId = searchParams.get("deckId");

    if (!deckId) {
      return errorResponse("deckId is required");
    }

    const { data: deck, error } = await supabase
      .from("deck")
      .select(
        `
        *,
        cards:flashcard(*),
        _count:flashcard(count)
      `
      )
      .eq("id", deckId)
      .single();

    if (error) throw error;

    if (!deck) {
      return errorResponse("Deck not found", 404);
    }

    // Format data for export
    const exportData = {
      name: deck.name,
      description: deck.description,
      cards: deck.cards.map(
        (card: {
          english_word: string;
          vietnamese_word: string;
          part_of_speech: string;
          example: string | null;
          memory_status: number;
        }) => ({
          englishWord: card.english_word,
          vietnameseWord: card.vietnamese_word,
          partOfSpeech: card.part_of_speech,
          example: card.example,
          memoryStatus: card.memory_status,
        })
      ),
    };

    return successResponse(exportData);
  } catch (error) {
    console.error("Error exporting deck:", error);
    return errorResponse("Failed to export deck", 500);
  }
}

// Import handler
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }
    const importData = await request.json();

    // Validate data format
    if (!importData.name || !Array.isArray(importData.cards)) {
      return errorResponse("Invalid data format");
    }

    // Create a new deck with imported data
    const { data: newDeck, error: deckError } = await supabase
      .from("deck")
      .insert([
        {
          name: importData.name,
          description: importData.description || null,
        },
      ])
      .select()
      .single();

    if (deckError) throw deckError;

    // Add all cards
    if (importData.cards.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cardsToCreate = importData.cards.map((card: any) => ({
        english_word: card.englishWord,
        vietnamese_word: card.vietnameseWord,
        part_of_speech: card.partOfSpeech || "other",
        example: card.example || null,
        memory_status: card.memoryStatus || 0,
        deck_id: newDeck.id,
      }));

      const { error: cardsError } = await supabase
        .from("flashcard")
        .insert(cardsToCreate);

      if (cardsError) throw cardsError;
    }

    // Get the complete deck with cards for response
    const { data: completeDeck, error: getDeckError } = await supabase
      .from("deck")
      .select(
        `
        *,
        cards:flashcard(*),
        _count:flashcard(count)
      `
      )
      .eq("id", newDeck.id)
      .single();

    if (getDeckError) throw getDeckError;

    return successResponse(
      {
        message: "Import successful",
        deck: completeDeck,
        importedCards: importData.cards.length,
      },
      201
    );
  } catch (error) {
    console.error("Error importing deck:", error);
    return errorResponse("Failed to import data", 500);
  }
}
