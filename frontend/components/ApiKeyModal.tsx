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
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl">
      <div className="w-full max-w-md animate-[fadeIn_300ms_ease-out] rounded-3xl border border-white/10 bg-black/80 backdrop-blur-2xl">
        {/* Header */}
        <div className="border-b border-white/10 p-8">
          <div className="mb-3 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div>
              <h2 className="font-light tracking-wider text-xl text-white">API KEY</h2>
              <p className="font-light tracking-wide text-sm text-white/40">Configure OpenRouter</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="mb-6 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5 backdrop-blur-xl">
            <div className="flex gap-3">
              <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="mb-1.5 font-light tracking-wide text-sm text-blue-300">Get your key</p>
                <p className="font-light tracking-wide text-xs text-blue-400/80">
                  Visit{" "}
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline transition-colors hover:text-blue-300"
                  >
                    openrouter.ai/keys
                  </a>{" "}
                  to generate your API key
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="api-key" className="mb-3 block font-light tracking-wider text-xs text-white/60">
              YOUR API KEY
            </label>
            <div className="relative">
              <input
                id="api-key"
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="w-full rounded-2xl border border-white/20 bg-white/5 px-5 py-4 pr-14 font-light tracking-wide text-white/90 backdrop-blur-xl placeholder:text-white/30 focus:border-white/40 focus:bg-white/10 focus:outline-none"
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 transition-all hover:text-white/60"
                aria-label={showKey ? "Hide" : "Show"}
              >
                {showKey ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            <div className="flex gap-3">
              <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-white/40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="font-light tracking-wide text-xs text-white/40">
                Stored locally in your browser. Only used to authenticate with OpenRouter.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-white/10 p-8">
          <button
            onClick={onCancel}
            className="flex-1 rounded-2xl border border-white/20 bg-white/5 px-4 py-3 font-light tracking-wider text-xs backdrop-blur-xl transition-all duration-300 hover:border-white/30 hover:bg-white/10 active:scale-95"
          >
            CANCEL
          </button>
          <button
            onClick={handleSave}
            disabled={!apiKey.trim()}
            className="flex-1 rounded-2xl border border-white/30 bg-white/20 px-4 py-3 font-light tracking-wider text-xs backdrop-blur-xl transition-all duration-300 hover:border-white/40 hover:bg-white/30 active:scale-95 disabled:border-white/10 disabled:bg-white/5 disabled:opacity-40"
          >
            SAVE KEY
          </button>
        </div>
      </div>
    </div>
  );
}
