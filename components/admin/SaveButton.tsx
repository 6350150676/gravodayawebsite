"use client";

import { useFormStatus } from "react-dom";
import { Loader2, Check } from "lucide-react";

/**
 * Submit button for the admin content forms. Shows a spinner while the server
 * action is running (via the enclosing <form>'s pending state).
 */
export function SaveButton({ label = "Save changes" }: { label?: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand)] text-white text-sm font-semibold px-5 py-2.5 hover:bg-[var(--color-brand-light)] transition-colors disabled:opacity-60"
    >
      {pending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
      {pending ? "Saving…" : label}
    </button>
  );
}
