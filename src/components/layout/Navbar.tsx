"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { useAuth } from "../auth/AuthProvider";

interface NavLinkProps {
  href: string;
  children: ReactNode;
  onClick?: () => void;
}

const NavLink = ({ href, children, onClick }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${
          isActive
            ? "bg-blue-600 text-white shadow"
            : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
        }`}
    >
      {children}
    </Link>
  );
};

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut, loading } = useAuth();

  const navLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/decks", label: "Decks" },
    { href: "/study", label: "Study" },
    { href: "/practice", label: "Practice" },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-extrabold md:text-lg lg:text-xl xl:text-2xl text-blue-600 tracking-tight">
                FlashCards
              </span>
            </Link>
            <div className="hidden md:flex gap-2">
              {navLinks.map((link) => (
                <NavLink key={link.href} href={link.href}>
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
          <div className="hidden md:flex items-center">
            <Link
              href="/decks/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow hover:bg-blue-700 transition-colors duration-200"
            >
              + Create Deck
            </Link>
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-controls="mobile-menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu, animated slide down */}
      <div
        className={`md:hidden bg-white shadow transition-all duration-300 overflow-hidden ${
          mobileOpen ? "max-h-[400px] py-4" : "max-h-0 py-0"
        }`}
        id="mobile-menu"
      >
        <div className="flex flex-col gap-2 px-4">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <Link
            href="/decks/new"
            className="px-4 py-2 mt-2 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow hover:bg-blue-700 transition-colors duration-200"
            onClick={() => setMobileOpen(false)}
          >
            + Create Deck
          </Link>
        </div>
      </div>
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
    </nav>
  );
}
