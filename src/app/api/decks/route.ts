import { successResponse, errorResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { Deck } from "@/lib/types";
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
    const deckId = searchParams.get("id");
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : undefined;

    if (deckId) {
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
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      if (!deck) return errorResponse("Deck not found", 404);
      return successResponse(deck);
    }

    let query = supabase
      .from("deck")
      .select(
        `
        *,
        _count:flashcard(count)
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (limit) {
      query = query.limit(limit);
    }
    const { data, error } = await query;
    if (error) throw error;
    const decks: Deck[] = data.map((deck) => ({
      id: deck.id,
      name: deck.name,
      description: deck.description,
      createdAt: deck.created_at,
      updatedAt: deck.updated_at,
      _count: {
        cards: deck._count.count,
      },
    }));
    return successResponse(decks);
  } catch (error) {
    console.error("Error fetching decks:", error);
    return errorResponse("Failed to fetch decks", 500);
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

    const body = await request.json();
    if (!body.name) {
      return errorResponse("Missing deck name");
    }

    const { data: newDeck, error } = await supabase
      .from("deck")
      .insert([
        {
          name: body.name,
          description: body.description || null,
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return successResponse(newDeck, 201);
  } catch (error) {
    console.error("Error creating deck:", error);
    return errorResponse("Failed to create deck", 500);
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
    const id = searchParams.get("id");
    const body = await request.json();

    if (!id || !body.name) {
      return errorResponse("Missing deck id or name", 400);
    }

    const { data: deckCheck, error: checkError } = await supabase
      .from("deck")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (checkError || !deckCheck) {
      return errorResponse(
        "Deck not found or you don't have permission to update it",
        403
      );
    }

    const { data: updatedDeck, error } = await supabase
      .from("deck")
      .update({
        name: body.name,
        description: body.description || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return successResponse(updatedDeck);
  } catch (error) {
    console.error("Error updating deck:", error);
    return errorResponse("Failed to update deck", 500);
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
    const deckId = searchParams.get("id");

    if (!deckId) {
      return errorResponse("Missing deck ID", 400);
    }

    const { data: deckCheck, error: checkError } = await supabase
      .from("deck")
      .select("id")
      .eq("id", deckId)
      .eq("user_id", user.id)
      .single();

    if (checkError || !deckCheck) {
      return errorResponse(
        "Deck not found or you don't have permission to delete it",
        403
      );
    }

    const { error } = await supabase.rpc("delete_deck_and_flashcards", {
      deck_id: deckId,
    });

    if (error) throw error;

    return successResponse({
      message: "Deck and its flashcards deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting deck and flashcards:", error);
    return errorResponse("Failed to delete deck and its flashcards", 500);
  }
}
