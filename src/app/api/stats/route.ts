import { successResponse, errorResponse } from "@/lib/api-utils";
import { createClient } from "@/lib/supabase/serverClient";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    // Get total count of decks
    const { count: totalDecks, error: decksError } = await supabase
      .from("deck")
      .select("*", { count: "exact", head: true });

    if (decksError) throw decksError;

    // Get total count of cards
    const { count: totalCards, error: cardsError } = await supabase
      .from("flashcard")
      .select("*", { count: "exact", head: true });

    if (cardsError) throw cardsError;

    // Get count of study sessions
    const { count: totalSessions, error: sessionsError } = await supabase
      .from("studysession")
      .select("*", { count: "exact", head: true });

    if (sessionsError) throw sessionsError;

    // Calculate additional stats
    let averageScore = 0;
    let completedSessions = 0;

    // Get completed sessions with scores
    const { data: sessions, error: completedSessionsError } = await supabase
      .from("studysession")
      .select("card_count, correct_count")
      .not("ended_at", "is", null);

    if (!completedSessionsError && sessions && sessions.length > 0) {
      completedSessions = sessions.length;
      const totalScore = sessions.reduce((sum, session) => {
        if (session.card_count > 0) {
          return sum + (session.correct_count / session.card_count) * 100;
        }
        return sum;
      }, 0);

      averageScore = Math.round(totalScore / completedSessions);
    }

    return successResponse({
      totalDecks: totalDecks || 0,
      totalCards: totalCards || 0,
      totalSessions: totalSessions || 0,
      completedSessions,
      averageScore,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return errorResponse("Failed to fetch stats", 500);
  }
}
