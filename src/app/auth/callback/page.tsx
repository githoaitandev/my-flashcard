"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/browserClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      alert("Processing authentication callback");
      try {
        console.log("Processing authentication callback");

        // Đăng nhập thành công, supabase tự cập nhật session
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          router.push("/auth/login");
          return;
        }

        if (data.session) {
          console.log("Authentication successful");
          router.push("/"); // Điều hướng sau đăng nhập
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
