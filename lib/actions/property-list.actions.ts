"use server";

import { getProperties } from "@/lib/queries/properties";
import type { PropertyFilters, PaginatedProperties } from "@/types";

export async function fetchPropertiesPage(
  filters: PropertyFilters,
  page: number,
): Promise<PaginatedProperties> {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  return getProperties(filters, safePage);
}
