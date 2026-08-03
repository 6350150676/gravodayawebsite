import { getProperties, PROPERTIES_PAGE_SIZE } from "@/lib/queries/properties";
import { getProjects } from "@/lib/queries/projects";
import type { PropertyFilters, SearchResults } from "@/types";

// Inventory lives in two tables: `projects` (whole developments — Ganga Vista,
// Divine Touch) and `properties` (individual resale/standalone units). A buyer
// filtering by city or budget means both, so every search surface — the hero
// search, the filter sidebar, the AI assistant — goes through here rather than
// querying one table and silently hiding the other.
//
// Projects are few and unpaginated; properties carry the pagination, which is
// why only `properties` grows as the user scrolls.
export async function getSearchResults(
  filters: PropertyFilters = {},
  propertyPage = 1,
  propertyPageSize = PROPERTIES_PAGE_SIZE,
): Promise<SearchResults> {
  const [projects, { items: properties, total: propertyTotal }] = await Promise.all([
    // Projects belong to page 1 only — they're the headline results and would
    // otherwise repeat under every scroll-loaded page.
    propertyPage === 1 ? getProjects(filters) : Promise.resolve([]),
    getProperties(filters, propertyPage, propertyPageSize),
  ]);

  return {
    projects,
    properties,
    propertyTotal,
    total: projects.length + propertyTotal,
  };
}
