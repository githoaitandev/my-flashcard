"use client";

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import { Flashcard, partsOfSpeech } from "@/lib/types";
import baseUrl from "@/utils/baseUrl";
import Link from "next/link";

export default function FlashcardDetail() {
  const params = useParams();
  const router = useRouter();
  const [flashcard, setFlashcard] = useState<Flashcard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    englishWord: "",
    vietnameseWord: "",
    partOfSpeech: "noun",
    example: "",
    memoryStatus: 0,
  });

  // Fetch flashcard data
  useEffect(() => {
    const fetchFlashcard = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(
          `${baseUrl}/api/flashcards?id=${params.id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch flashcard");
        }

        const data = await response.json();
        setFlashcard(data.data);

        // Initialize form data
        setFormData({
          englishWord: data.data.englishWord,
          vietnameseWord: data.data.vietnameseWord,
          partOfSpeech: data.data.partOfSpeech || "noun",
          example: data.data.example || "",
          memoryStatus: data.data.memoryStatus,
        });
      } catch (err) {
        console.error("Error fetching flashcard:", err);
        setError("Failed to load flashcard. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchFlashcard();
    }
  }, [params.id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const response = await fetch(`${baseUrl}/api/flashcards/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          id: params.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update flashcard");
      }

      // Redirect back to the deck page
      if (flashcard && flashcard.deckId) {
        router.push(`/decks/${flashcard.deckId}`);
      } else {
        router.push("/decks");
      }
    } catch (err) {
      console.error("Error updating flashcard:", err);
      setError("Failed to update flashcard. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this flashcard?")) {
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch(`${baseUrl}/api/flashcards/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete flashcard");
      }

      // Redirect back to the deck page
      if (flashcard && flashcard.deckId) {
        router.push(`/decks/${flashcard.deckId}`);
      } else {
        router.push("/decks");
      }
    } catch (err) {
      console.error("Error deleting flashcard:", err);
      setError("Failed to delete flashcard. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-8">Loading flashcard...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">{error}</p>
        <Link
          href="/decks"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          Return to Decks
        </Link>
      </div>
    );
  }

  if (!flashcard) {
    return (
      <div className="text-center p-8">
        <p>Flashcard not found</p>
        <Link
          href="/decks"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          Return to Decks
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Flashcard Details"
        description={`Editing flashcard: ${flashcard.englishWord}`}
      />

      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="englishWord"
                className="block text-base font-bold text-blue-700 mb-2"
              >
                English Word
              </label>
              <input
                type="text"
                name="englishWord"
                id="englishWord"
                value={formData.englishWord}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-lg border border-blue-200 shadow-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-100 text-gray-900 font-medium px-4 py-2"
              />
            </div>

            <div>
              <label
                htmlFor="vietnameseWord"
                className="block text-base font-bold text-blue-700 mb-2"
              >
                Vietnamese Word
              </label>
              <input
                type="text"
                name="vietnameseWord"
                id="vietnameseWord"
                value={formData.vietnameseWord}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-lg border border-blue-200 shadow-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-100 text-gray-900 font-medium px-4 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="partOfSpeech"
                className="block text-base font-bold text-blue-700 mb-2"
              >
                Part of Speech
              </label>
              <select
                id="partOfSpeech"
                name="partOfSpeech"
                value={formData.partOfSpeech}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-blue-200 shadow-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-100 text-gray-900 font-medium px-4 py-2"
              >
                {partsOfSpeech.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos.charAt(0).toUpperCase() + pos.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="memoryStatus"
                className="block text-base font-bold text-blue-700 mb-2"
              >
                Memory Status
              </label>
              <select
                id="memoryStatus"
                name="memoryStatus"
                value={formData.memoryStatus.toString()}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    memoryStatus: parseInt(e.target.value),
                  })
                }
                className="mt-1 block w-full rounded-lg border border-blue-200 shadow-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-100 text-gray-900 font-medium px-4 py-2"
              >
                <option value="0">New</option>
                <option value="1">Learning</option>
                <option value="2">Review</option>
                <option value="3">Mastered</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="example"
              className="block text-base font-bold text-blue-700 mb-2"
            >
              Example Sentence{" "}
              <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              id="example"
              name="example"
              value={formData.example}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-lg border border-blue-200 shadow-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-100 text-gray-900 font-medium px-4 py-2"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSaving}
                className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
              >
                Delete Flashcard
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Flashcard History
        </h2>
        <p className="text-gray-600">
          This card was created on{" "}
          {new Date(flashcard.createdAt).toLocaleDateString()}.
          {flashcard.lastReviewed && (
            <>
              {" "}
              Last reviewed on{" "}
              {new Date(flashcard.lastReviewed).toLocaleDateString()}
            </>
          )}
        </p>
      </div>
    </div>
  );
}
