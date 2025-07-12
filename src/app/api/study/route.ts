import { successResponse, errorResponse } from "@/lib/api-utils";
import { createClient } from "@/lib/supabase/serverClient";
import { NextRequest } from "next/server";

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
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : 20;
    const memoryStatus = searchParams.get("memoryStatus")
      ? parseInt(searchParams.get("memoryStatus")!)
      : undefined;

    let query = supabase.from("flashcard").select("*");
    if (deckId) {
      query = query.eq("deck_id", deckId);
    }
    if (memoryStatus !== undefined) {
      query = query.eq("memory_status", memoryStatus);
    }
    query = query
      .order("last_reviewed", { ascending: true, nullsFirst: true })
      .order("created_at", { ascending: false })
      .limit(limit);

    const { data: studyCards, error } = await query;
    if (error) throw error;
    return successResponse(studyCards);
  } catch (error) {
    console.error("Error fetching study cards:", error);
    return errorResponse("Failed to fetch study cards", 500);
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
    if (!body.cardCount) {
      return errorResponse("Missing required fields");
    }
    const { data: newSession, error } = await supabase
      .from("studysession")
      .insert([
        {
          deck_id: body.deckId || null,
          card_count: body.cardCount,
          started_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();
    if (error) throw error;
    if (body.endedAt) {
      await supabase
        .from("studysession")
        .update({
          correct_count: body.correctCount || 0,
          ended_at: body.endedAt,
        })
        .eq("id", newSession.id);
    }
    return successResponse(newSession, 201);
  } catch (error) {
    console.error("Error creating study session:", error);
    return errorResponse("Failed to create study session", 500);
  }
}
