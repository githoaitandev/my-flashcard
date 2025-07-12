# Authentication Implementation Documentation

## Overview

This document provides a comprehensive overview of the authentication system implemented in the Flashcard application. The authentication system uses Supabase Auth with email/password and Google OAuth provider.

## Database Changes

### Schema Modifications

1. **Added User Associations:**
   - Added `user_id` field to `Deck` table to associate decks with users
   - Added `user_id` field to `StudySession` table to associate study sessions with users

```sql
-- Updated Deck table with user_id
CREATE TABLE IF NOT EXISTS Deck (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Updated StudySession table with user_id
CREATE TABLE IF NOT EXISTS StudySession (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deck_id UUID REFERENCES Deck(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    card_count INTEGER NOT NULL,
    correct_count INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

2. **Added Row Level Security (RLS) Policies:**
   - Enabled RLS on all tables
   - Created policies to restrict data access by user_id

```sql
-- Enable Row Level Security
ALTER TABLE Deck ENABLE ROW LEVEL SECURITY;
ALTER TABLE Flashcard ENABLE ROW LEVEL SECURITY;
ALTER TABLE StudySession ENABLE ROW LEVEL SECURITY;

-- Create policies for Deck table
CREATE POLICY "Users can view their own decks" ON Deck
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own decks" ON Deck
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decks" ON Deck
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own decks" ON Deck
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for Flashcard table
CREATE POLICY "Users can view flashcards in their decks" ON Flashcard
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM Deck WHERE Deck.id = Flashcard.deck_id AND Deck.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert flashcards to their decks" ON Flashcard
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM Deck WHERE Deck.id = Flashcard.deck_id AND Deck.user_id = auth.uid()
    ));

CREATE POLICY "Users can update flashcards in their decks" ON Flashcard
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM Deck WHERE Deck.id = Flashcard.deck_id AND Deck.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete flashcards in their decks" ON Flashcard
    FOR DELETE USING (EXISTS (
        SELECT 1 FROM Deck WHERE Deck.id = Flashcard.deck_id AND Deck.user_id = auth.uid()
    ));

-- Create policies for StudySession table
CREATE POLICY "Users can view their own study sessions" ON StudySession
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study sessions" ON StudySession
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study sessions" ON StudySession
    FOR UPDATE USING (auth.uid() = user_id);
```

3. **Updated Database Functions:**
   - Updated `delete_deck_and_flashcards` function to include auth checks

```sql
-- Create RPC function for deleting deck with auth check
CREATE OR REPLACE FUNCTION delete_deck_and_flashcards(deck_id uuid)
RETURNS void AS $$
BEGIN
  -- Check if user owns the deck
  IF NOT EXISTS (SELECT 1 FROM Deck WHERE id = deck_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized to delete this deck';
  END IF;

  DELETE FROM Flashcard WHERE deck_id = delete_deck_and_flashcards.deck_id;
  DELETE FROM Deck WHERE id = delete_deck_and_flashcards.deck_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Authentication Components

### Authentication Provider

Created an AuthProvider component to manage authentication state globally:

```tsx
// File: src/components/auth/AuthProvider.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import type { User } from "@/lib/supabase/client";

// Protected routes that require authentication
const protectedRoutes = ["/decks", "/practice", "/study", "/flashcards"];

// Routes that are only accessible when not logged in
const authRoutes = ["/auth/login", "/auth/signup", "/auth/forgot-password"];

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      setUser(null);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/auth/login");
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        // Route protection logic
        const isProtectedRoute = protectedRoutes.some((route) =>
          pathname?.startsWith(route)
        );
        const isAuthRoute = authRoutes.some((route) => pathname === route);

        if (isProtectedRoute && !user) {
          router.push("/auth/login");
        } else if (isAuthRoute && user) {
          router.push("/decks");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, pathname]);

  return (
    <AuthContext.Provider value={{ user, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Authentication Pages

1. **Login Page (src/app/auth/login/page.tsx):**

   - Email/password login
   - Google OAuth login
   - Links to signup and forgot password pages
   - Success/error toast notifications

2. **Signup Page (src/app/auth/signup/page.tsx):**

   - Email/password registration
   - Password validation
   - Success/error toast notifications

3. **Forgot Password Page (src/app/auth/forgot-password/page.tsx):**

   - Email submission for password reset
   - Success/error toast notifications

4. **Update Password Page (src/app/auth/update-password/page.tsx):**

   - Password reset form
   - Password confirmation
   - Success/error toast notifications

5. **Auth Callback Handler (src/app/auth/callback/page.tsx):**
   - Handles OAuth and email verification callbacks
   - Exchanges auth code for session

## API Route Protection

### Authentication Utility

Created a utility function to check authentication in API routes:

```tsx
// File: src/lib/auth-utils.ts
import { supabase } from "./supabase/client";
import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "./api-utils";

export async function authenticateRequest(request: NextRequest) {
  // Get the auth cookie from the request
  const cookieHeader = request.headers.get("cookie") || "";

  if (!cookieHeader) {
    return { authenticated: false };
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { authenticated: false };
    }

    return {
      authenticated: true,
      user,
    };
  } catch (error) {
    console.error("Auth error:", error);
    return { authenticated: false };
  }
}
```

### Updated API Routes

Modified API routes to check authentication and filter data by user_id:

```tsx
// Example: GET method in src/app/api/decks/route.ts
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { authenticated, user } = await authenticateRequest(request);

    if (!authenticated) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const deckId = searchParams.get("id");
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : undefined;

    if (deckId) {
      // Get single deck by id, include cards and card count
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
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      if (!deck) return errorResponse("Deck not found", 404);
      return successResponse(deck);
    }

    // Get all decks (existing code)
    let query = supabase
      .from("deck")
      .select(
        `
        *,
        _count:flashcard(count)
      `
      )
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    // ...
  } catch (error) {
    // ...
  }
}

// Example: PUT method with permission check
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const { authenticated, user } = await authenticateRequest(request);

    if (!authenticated) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();

    if (!id || !body.name) {
      return errorResponse("Missing deck id or name", 400);
    }

    // Verify the deck belongs to the user
    const { data: deckCheck, error: checkError } = await supabase
      .from("deck")
      .select("id")
      .eq("id", id)
      .eq("user_id", user!.id)
      .single();

    if (checkError || !deckCheck) {
      return errorResponse(
        "Deck not found or you don't have permission to update it",
        403
      );
    }

    // Update the deck
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
    // ...
  } catch (error) {
    // ...
  }
}
```

## Route Protection with Middleware

Created a middleware to protect client-side routes:

```tsx
// File: src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

// Protected routes that require authentication
const protectedPaths = ["/decks", "/practice", "/study", "/flashcards"];

// Routes that are only accessible when not logged in
const authPaths = ["/auth/login", "/auth/signup", "/auth/forgot-password"];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Create supabase middleware client
  const supabase = createMiddlewareClient({ req: request, res: response });

  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Handle protected routes - redirect to login if not authenticated
  const isProtectedPath = protectedPaths.some((route) =>
    path.startsWith(route)
  );
  if (isProtectedPath && !user) {
    const redirectUrl = new URL("/auth/login", request.url);
    redirectUrl.searchParams.set("redirectedFrom", path);
    return NextResponse.redirect(redirectUrl);
  }

  // Handle auth routes - redirect to home if already authenticated
  const isAuthPath = authPaths.some((route) => path === route);
  if (isAuthPath && user) {
    return NextResponse.redirect(new URL("/decks", request.url));
  }

  return response;
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public|api).*)"],
};
```

## UI Components

### Updated Navbar

Modified the Navbar component to display auth status and actions:

```tsx
// File: src/components/layout/Navbar.tsx
import Link from "next/link";
import { useAuth } from "../auth/AuthProvider";

export default function Navbar() {
  const { user, signOut, loading } = useAuth();

  return (
    <header className="bg-gray-800 text-white shadow">
      <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold">
            Flashcard App
          </Link>
        </div>

        <nav className="flex items-center space-x-4">
          {!loading && (
            <>
              {user ? (
                <>
                  <Link
                    href="/decks"
                    className="px-3 py-2 rounded hover:bg-gray-700 transition-colors"
                  >
                    My Decks
                  </Link>
                  <div className="px-3 py-2">{user.email}</div>
                  <button
                    onClick={signOut}
                    className="px-3 py-2 bg-red-600 rounded hover:bg-red-700 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-3 py-2 rounded hover:bg-gray-700 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-3 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
```

## Supabase Configuration

Updated the Supabase client configuration to handle authentication:

```tsx
// File: src/lib/supabase/client.ts
import { createClient } from "@supabase/supabase-js";
import { type Database } from "../types/supabase";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type User = Awaited<
  ReturnType<typeof supabase.auth.getUser>
>["data"]["user"];
```

## Common Issue: Session Not Restored in App Router

### Problem

When using `createClient()` from `@supabase/supabase-js` directly in the Next.js App Router, the authentication session may not be restored automatically after OAuth login. This leads to users being redirected to the login page even after successful authentication (e.g., after Google OAuth).

#### Symptoms

- Console logs show `Authentication successful` after login callback.
- User is redirected to `/decks` but immediately sent back to `/auth/login`.
- Session is not recognized in client components or AuthProvider.

### Cause

`createClient()` does not automatically sync or restore the session from cookies/localStorage in the App Router context. This is a limitation when using Supabase directly in Next.js App Router.

### Solution

**Use Supabase Auth Helpers for Next.js:**

- Replace `createClient()` with `createClientComponentClient()` from `@supabase/auth-helpers-nextjs` in your Supabase client setup.
- This ensures session is restored and synchronized correctly between server and client.

#### Example Fix

```typescript
// src/lib/supabase/client.ts
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { type Database } from "../types/supabase";

export const supabase = createClientComponentClient<Database>();
```

**Make sure your `.env` file contains:**

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Additional Recommendations

- Use `onAuthStateChange` in your AuthProvider to listen for session changes and update UI accordingly.
- If you use middleware for route protection, use `createMiddlewareClient` from `@supabase/auth-helpers-nextjs`.

### References

- [Supabase Auth Helpers for Next.js Documentation](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

---

**Summary:**
Always use Supabase Auth Helpers (`createClientComponentClient`) in Next.js App Router to ensure session is restored and authentication works correctly after OAuth or other login flows.

## Environment Variables

Set up environment variables for Supabase authentication:

```
# .env file
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Installation Instructions

1. Install the required dependencies:

```bash
npm install @supabase/auth-helpers-nextjs
```

2. Set up Supabase Authentication:

   - Configure Email/Password authentication in Supabase dashboard
   - Set up Google OAuth provider in Supabase dashboard
   - Configure redirect URLs for OAuth and password reset

3. Apply database schema changes:

   - Run the SQL statements in your Supabase SQL editor

4. Configure environment variables:
   - Add the NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env file

## Conclusion

This authentication system provides a secure and user-friendly way to access the Flashcard application. Each user has their own personalized collection of decks and flashcards, isolated from other users. The system includes comprehensive auth flows for registration, login, password reset, and OAuth authentication.
