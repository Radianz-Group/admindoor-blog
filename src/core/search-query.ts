export function truncateSearchQuery(query: string, maxLength: number): string {
  return query.slice(0, maxLength);
}

export function normalizeSearchQuery(query: string): string {
  return query.trim().replace(/\s+/g, " ");
}

/** Reads and normalizes the search query from a location search string (e.g. `?q=terms`). */
export function resolveSearchQueryFromLocationSearch(
  locationSearch: string,
  queryParam: string,
  maxQueryLength: number,
): string {
  const value = new URLSearchParams(locationSearch).get(queryParam) ?? "";
  return normalizeSearchQuery(truncateSearchQuery(value, maxQueryLength));
}
