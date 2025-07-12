"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase/browserClient";
import { useRouter, usePathname } from "next/navigation";
import type { User } from "@/lib/supabase/browserClient";

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
    } catch {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
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
