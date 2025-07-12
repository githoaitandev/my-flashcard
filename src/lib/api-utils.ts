import { NextResponse } from "next/server";
import camelcaseKeys from "camelcase-keys";
import snakecaseKeys from "snakecase-keys";

// Success response helper with camelCase conversion
export function successResponse<T>(data: T, status = 200) {
  // Convert all keys in data object to camelCase
  const camelCasedData = camelcaseKeys(data as Record<string, unknown>, {
    deep: true,
  });
  return NextResponse.json({ success: true, data: camelCasedData }, { status });
}

// Error response helper
export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// Convert request body to snake_case
export function toSnakeCase<T>(data: T): Record<string, unknown> {
  return snakecaseKeys(data as Record<string, unknown>, { deep: true });
}
