"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { PropertyCard } from "@/components/public/PropertyCard";
import { Reveal } from "@/components/public/Reveal";
import { fetchPropertiesPage } from "@/lib/actions/property-list.actions";
import type { PropertyWithRelations, PropertyFilters } from "@/types";

interface Props {
  initial: PropertyWithRelations[];
  total: number;
  filters: PropertyFilters;
  supabaseUrl: string;
}

// First page is server-rendered; later pages load via a scroll sentinel.
export function PropertyInfiniteList({ initial, total, filters, supabaseUrl }: Props) {
  const [items, setItems] = useState<PropertyWithRelations[]>(initial);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const hasMore = items.length < total;

  const loadMore = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const next = page + 1;
      const { items: more } = await fetchPropertiesPage(filters, next);
      setItems((prev) => {
        // racing requests can return the same rows twice
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...more.filter((p) => !seen.has(p.id))];
      });
      setPage(next);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loading || error) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, error, loadMore]);

  return (
    <div>
      <div className="space-y-5">
        {items.map((p, i) => (
          <Reveal key={p.id} delay={Math.min(i % 9, 4) * 70}>
            <PropertyCard property={p} supabaseUrl={supabaseUrl} layout="horizontal" />
          </Reveal>
        ))}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className="flex flex-col items-center gap-3 py-10">
          {loading && (
            <span className="flex items-center gap-2 text-sm text-gray-400">
              <Loader2 size={16} className="animate-spin text-[var(--color-royal)]" />
              Loading more…
            </span>
          )}
          {error && (
            <button
              type="button"
              onClick={loadMore}
              className="text-sm font-semibold text-[var(--color-royal)] hover:underline"
            >
              Couldn&apos;t load more — tap to retry
            </button>
          )}
        </div>
      )}

      {!hasMore && items.length > 0 && (
        <p className="text-center text-xs text-gray-400 py-10">
          You&apos;ve seen all {total} {total === 1 ? "property" : "properties"}.
        </p>
      )}
    </div>
  );
}
