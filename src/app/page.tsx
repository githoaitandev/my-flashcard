"use client";

import PageHeader from "@/components/layout/PageHeader";
import DeckCard from "@/components/decks/DeckCard";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Deck } from "@/lib/types";
import baseUrl from "@/utils/baseUrl";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [recentDecks, setRecentDecks] = useState<Deck[]>([]);
  const [stats, setStats] = useState({ totalDecks: 0, totalCards: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data when authenticated
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch recent decks
        const decksRes = await fetch(`${baseUrl}/api/decks?limit=4`);
        if (decksRes.ok) {
          const decksJson = await decksRes.json();
          setRecentDecks(decksJson.data || []);
        }

        // Fetch stats
        const statsRes = await fetch(`${baseUrl}/api/stats`);
        if (statsRes.ok) {
          const statsJson = await statsRes.json();
          setStats(statsJson.data || { totalDecks: 0, totalCards: 0 });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch when user is authenticated
    if (!loading) {
      if (user) {
        fetchData();
      } else {
        router.push("/auth/login");
      }
    }
  }, [user, loading, router]);

  if (loading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="English Flashcards"
        description="Learn and practice English vocabulary with flashcards"
      />

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Total Decks</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalDecks}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">
            Total Flashcards
          </h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalCards}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 md:col-span-2 lg:col-span-1">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          <div className="mt-4 space-y-2">
            <Link
              href="/decks/new"
              className="block w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Create New Deck
            </Link>
            <Link
              href="/study"
              className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Study Flashcards
            </Link>
            <Link
              href="/practice"
              className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Practice Writing
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Decks */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Recent Decks</h2>
          <Link
            href="/decks"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View all decks →
          </Link>
        </div>

        {recentDecks && recentDecks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentDecks.map((deck: Deck) => (
              <DeckCard key={deck.id} deck={deck} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">
              You don&apos;t have any decks yet
            </p>
            <Link
              href="/decks/new"
              className="inline-block px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Create your first deck
            </Link>
          </div>
        )}
      </div>
      <p>It&apos;s a great day to learn!</p>
    </div>
  );
}
