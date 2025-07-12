"use client";

import baseUrl from "@/utils/baseUrl";
import { useState } from "react";

interface ImportExportProps {
  deckId: string;
  deckName: string;
  onImportSuccess?: () => void;
}

export default function ImportExport({
  deckId,
  deckName,
  onImportSuccess,
}: ImportExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle export function
  const handleExport = async () => {
    try {
      setIsExporting(true);
      setError(null);

      const response = await fetch(
        `${baseUrl}/api/import-export?deckId=${deckId}`
      );

      if (!response.ok) {
        throw new Error("Failed to export deck");
      }

      const data = await response.json();

      // Create and download file
      const exportData = JSON.stringify(data.data, null, 2);
      const blob = new Blob([exportData], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${deckName.replace(/\s+/g, "_")}_export.json`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      setError("Failed to export deck. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
      setError(null);
    }
  };

  // Handle import function
  const handleImport = async () => {
    if (!importFile) {
      setError("Please select a file to import");
      return;
    }

    try {
      setIsImporting(true);
      setError(null);

      // Read file
      const fileContent = await readFileAsText(importFile);
      let importData;
      try {
        importData = JSON.parse(fileContent);
      } catch {
        throw new Error("Invalid JSON file");
      }

      // Send to API
      const response = await fetch(`${baseUrl}/api/import-export`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(importData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Import failed");
      }

      // Success - reset form and notify parent
      setImportFile(null);
      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (error) {
      console.error("Import error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to import deck"
      );
    } finally {
      setIsImporting(false);
    }
  };

  // Helper function to read file
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Import / Export
      </h3>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Export Section */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Export Deck
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            Export this deck as a JSON file that can be imported later.
          </p>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isExporting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isExporting ? "Exporting..." : "Export as JSON"}
          </button>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Import Deck
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            Import a deck from a JSON file. This will create a new deck.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Select file
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>

          <button
            onClick={handleImport}
            disabled={!importFile || isImporting}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
              !importFile || isImporting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isImporting ? "Importing..." : "Import Deck"}
          </button>
        </div>
      </div>
    </div>
  );
}
