import { supabase } from "./supabase/browserClient";
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
