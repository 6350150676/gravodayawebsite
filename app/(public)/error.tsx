"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Public Error]", error);
  }, [error]);

  return (
    <main className="bg-[var(--color-sand)] min-h-[70vh] flex items-center justify-center px-4 py-20 text-center">
      <div>
        <p className="text-[var(--color-gold)] text-xs font-bold tracking-[0.2em] uppercase mb-3">
          Error
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-brand)] leading-tight">
          Something went wrong
        </h1>
        <p className="mt-3 text-gray-500 text-sm max-w-md mx-auto">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={reset}
            className="bg-[var(--color-brand)] text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-[var(--color-brand-light)] transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="border border-[var(--color-brand)]/20 text-[var(--color-brand)] px-6 py-3 rounded-full text-sm font-bold hover:bg-white transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
