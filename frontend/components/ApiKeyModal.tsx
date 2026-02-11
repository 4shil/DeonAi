"use client";

import { useState } from "react";

type ApiKeyModalProps = {
  onSave: (apiKey: string) => void;
  onCancel: () => void;
  currentKey?: string;
};

export default function ApiKeyModal({
  onSave,
  onCancel,
  currentKey,
}: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState(currentKey || "");

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          OpenRouter API Key
        </h2>
        <p className="mb-4 text-sm text-gray-600">
          Enter your OpenRouter API key to access AI models. Get your key at{" "}
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            openrouter.ai/keys
          </a>
        </p>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-or-v1-..."
          className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
