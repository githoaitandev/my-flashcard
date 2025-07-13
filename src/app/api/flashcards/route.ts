import { successResponse, errorResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { FlashcardCreate } from "@/lib/types";
import { createClient } from "@/lib/supabase/serverClient";

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
    const id = searchParams.get("id");
    const deckId = searchParams.get("deckId");

    if (id) {
      // Fetch a single flashcard by ID
      const { data: flashcard, error } = await supabase
        .from("flashcard")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (!flashcard) {
        return errorResponse("Flashcard not found", 404);
      }

      return successResponse(flashcard);
    } else if (deckId) {
      // Fetch flashcards by deck ID
      const { data: flashcards, error } = await supabase
        .from("flashcard")
        .select("*")
        .eq("deck_id", deckId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return successResponse(flashcards);
    } else {
      // Fetch all flashcards (with limit)
      const limit = searchParams.get("limit") || "100";

      const { data: flashcards, error } = await supabase
        .from("flashcard")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(parseInt(limit));

      if (error) throw error;

      return successResponse(flashcards);
    }
  } catch (error) {
    console.error("Error fetching flashcards:", error);
    return errorResponse("Failed to fetch flashcards", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return errorResponse("Unauthorized", 401);
    }
    const data: FlashcardCreate = await request.json();
    if (!data.englishWord || !data.vietnameseWord || !data.deckId) {
      return errorResponse("Missing required fields");
    }
    const { data: newFlashcard, error } = await supabase
      .from("flashcard")
      .insert([
        {
          english_word: data.englishWord,
          vietnamese_word: data.vietnameseWord,
          part_of_speech: data.partOfSpeech,
          example: data.example || null,
          deck_id: data.deckId,
          memory_status: 0,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return successResponse(newFlashcard, 201);
  } catch (error) {
    console.error("Error creating flashcard:", error);
    return errorResponse("Failed to create flashcard", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return errorResponse("Unauthorized", 401);
    }
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get("id");
    const memoryStatus = searchParams.get("memoryStatus");
    if (!cardId || memoryStatus === null) {
      return errorResponse("Missing required parameters");
    }
    const { data: updatedFlashcard, error } = await supabase
      .from("flashcard")
      .update({
        memory_status: parseInt(memoryStatus),
        last_reviewed: new Date().toISOString(),
      })
      .eq("id", cardId)
      .select()
      .single();
    if (error) throw error;
    return successResponse(updatedFlashcard);
  } catch (error) {
    console.error("Error updating flashcard:", error);
    return errorResponse("Failed to update flashcard", 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return errorResponse("Unauthorized", 401);
    }
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get("id");

    if (!cardId) {
      return errorResponse("Missing required parameter: id", 400);
    }

    const { data: deletedFlashcard, error } = await supabase
      .from("flashcard")
      .delete()
      .eq("id", cardId)
      .select()
      .single();

    if (error) throw error;

    return successResponse(deletedFlashcard, 200);
  } catch (error) {
    console.error("Error deleting flashcard:", error);
    return errorResponse("Failed to delete flashcard", 500);
  }
}
