"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Loader2, Sparkles } from "lucide-react";
import { PropertyCard } from "@/components/public/PropertyCard";
import type { PropertyWithRelations } from "@/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

const EXAMPLES = [
  "3 BHK apartment in Dehradun under 80 lakh",
  "Villa for rent with a garden",
  "Plots in Haridwar",
];

interface Turn {
  role: "user" | "bot";
  text: string;
  properties?: PropertyWithRelations[];
  total?: number;
}

export function ChatSearch() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([
    {
      role: "bot",
      text: "Hi! Tell me what you're looking for and I'll find matching properties. Try one of the examples below.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, loading]);

  async function send(prompt: string) {
    const text = prompt.trim();
    if (!text || loading) return;

    setTurns((t) => [...t, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });
      const data = await res.json();

      if (!res.ok) {
        setTurns((t) => [...t, { role: "bot", text: data.error || "Something went wrong. Please try again." }]);
      } else if (!data.properties?.length) {
        setTurns((t) => [
          ...t,
          { role: "bot", text: "I couldn't find any properties matching that. Try adjusting your budget or location." },
        ]);
      } else {
        setTurns((t) => [
          ...t,
          { role: "bot", text: data.reply, properties: data.properties, total: data.total },
        ]);
      }
    } catch {
      setTurns((t) => [...t, { role: "bot", text: "Network error — please check your connection and try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Launcher button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open property assistant"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[var(--color-brand)] px-5 py-3.5 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          <MessageSquare size={20} />
          <span className="hidden sm:inline text-sm font-semibold">Find a property</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[400px] sm:rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between bg-[var(--color-brand)] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-[var(--color-gold)]" />
              <span className="font-semibold">Property Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-full p-1 hover:bg-white/20">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-[var(--color-sand)] p-4">
            {turns.map((turn, i) => (
              <div key={i}>
                <div className={turn.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                      turn.role === "user"
                        ? "bg-[var(--color-brand)] text-white"
                        : "bg-white text-gray-800 shadow-sm"
                    }`}
                  >
                    {turn.text}
                    {turn.total != null && turn.total > (turn.properties?.length ?? 0) && (
                      <span className="mt-1 block text-xs text-gray-400">
                        Showing {turn.properties?.length} of {turn.total} matches.
                      </span>
                    )}
                  </div>
                </div>

                {turn.properties && (
                  <div className="mt-3 space-y-3">
                    {turn.properties.map((p) => (
                      <PropertyCard key={p.id} property={p} supabaseUrl={SUPABASE_URL} />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 text-sm text-gray-500 shadow-sm">
                  <Loader2 size={15} className="animate-spin" /> Searching…
                </div>
              </div>
            )}

            {/* Example prompts (only before the first search) */}
            {turns.length === 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-1">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => send(ex)}
                    className="rounded-full border border-[var(--color-brand)]/30 bg-white px-3 py-1.5 text-xs text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand)] hover:text-white"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-gray-100 bg-white p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. 2 BHK flat in Rishikesh…"
              className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-brand)]"
              maxLength={500}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send"
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-brand)] text-white transition-opacity disabled:opacity-40"
            >
              <Send size={17} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
