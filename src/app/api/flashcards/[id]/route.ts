import { NextRequest } from "next/server";
import { successResponse, errorResponse, toSnakeCase } from "@/lib/api-utils";
import { createClient } from "@/lib/supabase/serverClient";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }
    const { id } = params;

    if (!id) {
      return errorResponse("Missing flashcard ID", 400);
    }

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
  } catch (error) {
    console.error("Error fetching flashcard:", error);
    return errorResponse("Failed to fetch flashcard", 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }
    const { id } = params;
    const body = await request.json();

    if (!id || !body.englishWord || !body.vietnameseWord) {
      return errorResponse("Missing required fields", 400);
    }

    const updateData = {
      english_word: body.englishWord,
      vietnamese_word: body.vietnameseWord,
      part_of_speech: body.partOfSpeech || "noun",
      example: body.example || null,
      memory_status: body.memoryStatus !== undefined ? body.memoryStatus : 0,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedFlashcard, error } = await supabase
      .from("flashcard")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return successResponse(updatedFlashcard);
  } catch (error) {
    console.error("Error updating flashcard:", error);
    return errorResponse("Failed to update flashcard", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }
    const { id } = params;

    if (!id) {
      return errorResponse("Missing flashcard ID", 400);
    }

    const { data: deletedFlashcard, error } = await supabase
      .from("flashcard")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return successResponse(deletedFlashcard);
  } catch (error) {
    console.error("Error deleting flashcard:", error);
    return errorResponse("Failed to delete flashcard", 500);
  }
}
