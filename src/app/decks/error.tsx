"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DecksError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-2xl w-full text-center">
        <h2 className="text-2xl font-bold text-red-800 mb-4">
          Something went wrong!
        </h2>
        <p className="text-red-600 mb-6">
          {error.message || "Failed to load decks"}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={reset}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
}
