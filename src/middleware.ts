import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Protected routes that require authentication
const protectedPaths = [
  "/decks",
  "/decks/*",
  "/practice",
  "/study",
  "/flashcards",
  "/",
];

// Routes that are only accessible when not logged in
const authPaths = ["/auth/login", "/auth/signup", "/auth/forgot-password"];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });
  // Create supabase middleware client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            return supabaseResponse.cookies.set(name, value, {
              ...options,
              secure: true, // Đảm bảo cookie chỉ được gửi qua HTTPS
              sameSite: "none", // Hỗ trợ cross-site
            });
          });
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  // Handle protected routes - redirect to login if not authenticated
  const isProtectedPath = protectedPaths.some((route) => {
    if (route.endsWith("/*")) {
      const base = route.replace("/*", "");
      return path === base || path.startsWith(`${base}/`);
    }
    return path === route;
  });
  console.log(
    "Checking path:",
    path,
    "Protected:",
    isProtectedPath,
    "User:",
    user
  );
  if (isProtectedPath && !user) {
    const redirectUrl = new URL("/auth/login", request.url);
    redirectUrl.searchParams.set("redirectedFrom", path);
    return NextResponse.redirect(redirectUrl);
  }

  // Handle auth routes - redirect to home if already authenticated
  const isAuthPath = authPaths.some((route) => path === route);
  if (isAuthPath && user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return supabaseResponse;
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
