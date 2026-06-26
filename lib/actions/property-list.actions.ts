"use server";

import { getProperties } from "@/lib/queries/properties";
import type { PropertyFilters, PaginatedProperties } from "@/types";

/**
 * Fetches one page of properties for the public listings page. Called by the
 * infinite-scroll list as the visitor scrolls. Reads through the same query
 * (and RLS) as the initial server render, so only `active` properties leak.
 */
export async function fetchPropertiesPage(
  filters: PropertyFilters,
  page: number,
): Promise<PaginatedProperties> {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  return getProperties(filters, safePage);
}
