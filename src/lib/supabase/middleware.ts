import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "./serverClient";

// Protected routes that require authentication
const protectedPaths = ["/decks", "/practice", "/study", "/flashcards"];

// Routes that are only accessible when not logged in
// const authPaths = ["/auth/login", "/auth/signup", "/auth/forgot-password"];

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtectedPath = protectedPaths.some((route) =>
    path.startsWith(route)
  );
  if (!user && isProtectedPath) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
