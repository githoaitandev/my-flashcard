import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

// Protected routes that require authentication
const protectedPaths = ["/decks", "/practice", "/study", "/flashcards"];

// Routes that are only accessible when not logged in
const authPaths = ["/auth/login", "/auth/signup", "/auth/forgot-password"];

export async function middleware(request: NextRequest) {
  //   const response = NextResponse.next();

  //   // Create supabase middleware client
  //   const supabase = createMiddlewareClient({ req: request, res: response });

  //   // Refresh session if expired - required for Server Components
  //   await supabase.auth.getSession();

  //   // Check if user is authenticated
  //   const {
  //     data: { user },
  //   } = await supabase.auth.getUser();

  //   const path = request.nextUrl.pathname;

  //   // Handle protected routes - redirect to login if not authenticated
  //   const isProtectedPath = protectedPaths.some((route) =>
  //     path.startsWith(route)
  //   );
  //   if (isProtectedPath && !user) {
  //     const redirectUrl = new URL("/auth/login", request.url);
  //     redirectUrl.searchParams.set("redirectedFrom", path);
  //     return NextResponse.redirect(redirectUrl);
  //   }

  //   // Handle auth routes - redirect to home if already authenticated
  //   const isAuthPath = authPaths.some((route) => path === route);
  //   if (isAuthPath && user) {
  //     return NextResponse.redirect(new URL("/decks", request.url));
  //   }

  //   return response;
  return await updateSession(request);
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (they handle their own auth)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};
