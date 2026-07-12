import Link from "next/link";

export default function RootNotFound() {
  return (
    <main className="bg-[var(--color-sand)] min-h-screen flex items-center justify-center px-4 text-center">
      <div>
        <p className="text-[var(--color-gold)] text-xs font-bold tracking-[0.2em] uppercase mb-3">
          404
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-brand)] leading-tight">
          Page not found
        </h1>
        <p className="mt-3 text-gray-500 text-sm max-w-md mx-auto">
          The page you're looking for doesn't exist, or the property may no longer be listed.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-8 bg-[var(--color-brand)] text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-[var(--color-brand-light)] transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
