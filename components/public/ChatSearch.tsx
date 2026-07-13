"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Loader2, Mic, MicOff } from "lucide-react";
import { PropertyCard } from "@/components/public/PropertyCard";
import type { PropertyWithRelations } from "@/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

interface SpeechRecognitionResultLike {
  0: { transcript: string };
}
interface SpeechRecognitionEventLike extends Event {
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
}

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

const EXAMPLES = [
  "3 BHK apartment in Haridwar under 80 lakh",
  "Villa for rent with a garden",
  "Plots in Kankhal",
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
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const shouldListenRef = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, loading]);

  useEffect(() => {
    setVoiceSupported(!!getSpeechRecognitionCtor());
    return () => {
      shouldListenRef.current = false;
      recognitionRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (!open) {
      shouldListenRef.current = false;
      recognitionRef.current?.stop();
    }
  }, [open]);

  function startRecognition() {
    const SpeechRecognitionCtor = getSpeechRecognitionCtor();
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-IN";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
    };
    recognition.onerror = (event) => {
      // "no-speech" fires on silence during continuous listening — harmless, onend will restart it.
      if (event.error !== "no-speech") {
        shouldListenRef.current = false;
        setListening(false);
      }
    };
    recognition.onend = () => {
      if (shouldListenRef.current) {
        recognition.start();
      } else {
        setListening(false);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  function toggleListening() {
    if (listening) {
      shouldListenRef.current = false;
      recognitionRef.current?.stop();
      return;
    }

    shouldListenRef.current = true;
    startRecognition();
  }

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
          aria-label="Open chatbot property assistant"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[var(--color-brand)] px-5 py-3.5 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          <Bot size={20} />
          <span className="text-sm font-semibold">Assistant</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[400px] sm:rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between bg-[var(--color-brand)] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Bot size={18} className="text-[var(--color-gold)]" />
              <span className="font-semibold">Property Chatbot</span>
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
              placeholder={listening ? "Listening…" : "e.g. 2 BHK flat in Haridwar…"}
              className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-brand)]"
              maxLength={500}
            />
            {voiceSupported && (
              <button
                type="button"
                onClick={toggleListening}
                disabled={loading}
                aria-label={listening ? "Stop voice input" : "Start voice input"}
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-40 ${
                  listening
                    ? "animate-pulse bg-red-500 text-white"
                    : "bg-gray-100 text-[var(--color-brand)] hover:bg-gray-200"
                }`}
              >
                {listening ? <MicOff size={17} /> : <Mic size={17} />}
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send"
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-brand)] text-white transition-opacity disabled:opacity-40"
            >
              <Send size={17} />
            </button>
          </form>
          {!voiceSupported && (
            <p className="bg-white px-3 pb-2.5 text-center text-[11px] text-gray-400">
              Tip: tap the mic on your keyboard to dictate
            </p>
          )}
        </div>
      )}
    </>
  );
}
