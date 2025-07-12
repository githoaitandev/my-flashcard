"use client";

import { useState } from "react";
import { FlashcardCreate, PartOfSpeech, partsOfSpeech } from "@/lib/types";
import { useRouter } from "next/navigation";

interface FlashcardFormProps {
  onSubmit: (data: FlashcardCreate) => Promise<void>;
  deckId: string;
  isLoading?: boolean;
}

export default function FlashcardForm({
  onSubmit,
  deckId,
  isLoading = false,
}: FlashcardFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<FlashcardCreate>({
    englishWord: "",
    vietnameseWord: "",
    partOfSpeech: "noun",
    example: "",
    deckId,
  });

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
    await onSubmit(formData);
    setFormData({
      englishWord: "",
      vietnameseWord: "",
      partOfSpeech: "noun",
      example: "",
      deckId,
    });
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 bg-white p-8 rounded-xl shadow-lg border border-blue-100"
    >
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
          className="mt-1 block w-full rounded-lg border border-blue-200 shadow-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-100 text-gray-900 font-medium  px-4 py-2"
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
          className="mt-1 block w-full rounded-lg border border-blue-200 shadow-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-100 text-gray-900 font-medium  px-4 py-2"
        />
      </div>

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
          className="mt-1 block w-full rounded-lg border border-blue-200 shadow-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-100 text-gray-900 font-medium  px-4 py-2"
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
          className="mt-1 block w-full rounded-lg border border-blue-200 shadow-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-100 text-gray-900 font-medium  px-4 py-2"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transition ${
            isLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Adding..." : "Add Flashcard"}
        </button>
      </div>
    </form>
  );
}
