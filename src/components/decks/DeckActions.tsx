"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import Link from "next/link";
import baseUrl from "@/utils/baseUrl";
import Toast from "@/components/ui/Toast";
import { useRouter } from "next/navigation";

interface DeckActionsProps {
  deck: {
    id: string;
    name: string;
    description?: string;
  };
}
const TOAST_ALIVE_DURATION = 3000;
export default function DeckActions({ deck }: DeckActionsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editName, setEditName] = useState(deck.name);
  const [editDescription, setEditDescription] = useState(
    deck.description || ""
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastStatus, setToastStatus] = useState<
    "success" | "error" | "default"
  >("default");

  const handleUpdateDeck = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`${baseUrl}/api/decks?id=${deck.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, description: editDescription }),
      });

      if (!response.ok) {
        throw new Error("Failed to update deck");
      }

      setToastMessage("Deck updated successfully!");
      setToastStatus("success");
    } catch (error) {
      setToastMessage("Error updating deck");
      setToastStatus("error");
    } finally {
      setIsUpdating(false);
      setOpen(false);
      setToastVisible(true);
    }
  };

  const handleDeleteDeck = async () => {
    if (deleteConfirmText !== `YES-${deck.name}`) {
      setDeleteError(`Please type YES-${deck.name} to confirm deletion.`);
      return;
    }
    setIsDeleting(true);
    try {
      const response = await fetch(`${baseUrl}/api/decks?id=${deck.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete deck");
      }

      setToastMessage("Deck deleted successfully!");
      setToastStatus("success");
      setTimeout(() => {
        router.push("/decks");
      }, TOAST_ALIVE_DURATION);
    } catch (error) {
      setToastMessage("Error deleting deck");
      setToastStatus("error");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setDeleteConfirmText("");
      setDeleteError("");
      setToastVisible(true);
    }
  };

  return (
    <div className="flex space-x-2">
      <Link
        href={`/study?deckId=${deck.id}`}
        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700"
      >
        Study Deck
      </Link>
      <Link
        href={`/practice?deckId=${deck.id}`}
        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50"
      >
        Practice Writing
      </Link>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
      >
        Edit Deck
      </button>
      <button
        onClick={() => setDeleteDialogOpen(true)}
        disabled={isDeleting}
        className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-semibold rounded-md text-red-700 bg-red-100 hover:bg-red-200 disabled:opacity-50 cursor-pointer"
      >
        {isDeleting ? "Deleting..." : "Delete Deck"}
      </button>

      {/* Edit Deck Dialog */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 backdrop-blur-[1px] z-40" />
          <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <Dialog.Title className="text-lg font-bold mb-4">
              Edit Deck
            </Dialog.Title>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateDeck();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Deck Confirmation Dialog */}
      <Dialog.Root open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 backdrop-blur-[1px] z-40" />
          <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <Dialog.Title className="text-lg font-bold mb-4 text-red-700">
              Confirm Delete Deck
            </Dialog.Title>
            <p className="mb-4 text-gray-700">
              To delete this deck, type{" "}
              <span className="font-bold">YES-{deck.name}</span> below and click
              Delete.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => {
                setDeleteConfirmText(e.target.value);
                setDeleteError("");
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 mb-2"
              placeholder={`Type YES-${deck.name}`}
            />
            {deleteError && (
              <div className="text-red-600 text-sm mb-2">{deleteError}</div>
            )}
            <div className="flex justify-end gap-2 mt-6">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="button"
                disabled={
                  isDeleting || deleteConfirmText !== `YES-${deck.name}`
                }
                onClick={handleDeleteDeck}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Toast notification */}
      <Toast
        show={toastVisible}
        message={toastMessage}
        onClose={() => setToastVisible(false)}
        duration={TOAST_ALIVE_DURATION}
        status={toastStatus}
      />
    </div>
  );
}
