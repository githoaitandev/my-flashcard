"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/browserClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("Processing authentication callback");

        // Lấy access_token và refresh_token từ URL hash
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken && refreshToken) {
          // Thiết lập session với Supabase
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("Error setting session:", error);
            router.push("/auth/login");
            return;
          }

          console.log("Session successfully set");
        }

        // Chờ session được thiết lập
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Error getting session:", sessionError);
          router.push("/auth/login");
          return;
        }

        if (data?.session) {
          console.log("Authentication successful");
          router.push("/");
        } else {
          console.log("No session found, redirecting to login");
          router.push("/auth/login");
        }
      } catch (err) {
        console.error("Error during authentication:", err);
        router.push("/auth/login");
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-center">Authenticating...</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    </div>
  );
}
