import { useRef, useState } from "react";
import type { WorkspaceJson } from '@c4/c4-parser'

interface WorkspaceLoaderProps {
  onWorkspaceLoaded: (workspace: WorkspaceJson) => void;
}

export function WorkspaceLoader({ onWorkspaceLoaded }: WorkspaceLoaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function parseFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        setError(null);
        onWorkspaceLoaded(json as WorkspaceJson);
      } catch {
        setError(
          `Failed to parse "${file.name}" as JSON. Please upload a valid Structurizr workspace JSON file.`,
        );
      }
    };
    reader.readAsText(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-16 transition-colors ${
          isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className="text-xl font-semibold text-gray-700">
          Drop your Structurizr workspace JSON here
        </p>
        <p className="text-sm text-gray-500">
          or{" "}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-blue-600 underline hover:text-blue-800"
          >
            click to browse
          </button>
        </p>
        {error && (
          <p role="alert" className="max-w-sm text-center text-sm text-red-600">
            {error}
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileChange}
          data-testid="file-input"
        />
      </div>
    </div>
  );
}
