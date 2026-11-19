import { describe, expect, it } from "vitest";

import {
  normalizeSearchQuery,
  resolveSearchQueryFromLocationSearch,
  truncateSearchQuery,
} from "../../src/core/search-query";

describe("search query helpers", () => {
  it("truncates queries to the configured character limit", () => {
    expect(truncateSearchQuery("search terms", 6)).toBe("search");
  });

  it("trims and collapses whitespace", () => {
    expect(normalizeSearchQuery("  weighted \n  search  ")).toBe("weighted search");
  });
});

describe("resolveSearchQueryFromLocationSearch", () => {
  it("returns an empty string when the query param is missing or blank", () => {
    expect(resolveSearchQueryFromLocationSearch("", "q", 100)).toBe("");
    expect(resolveSearchQueryFromLocationSearch("?page=1", "q", 100)).toBe("");
    expect(resolveSearchQueryFromLocationSearch("?q=", "q", 100)).toBe("");
    expect(resolveSearchQueryFromLocationSearch("?q=+%20", "q", 100)).toBe("");
  });

  it("reads, truncates, and normalizes the configured query param", () => {
    expect(resolveSearchQueryFromLocationSearch("?q=react+search", "q", 100)).toBe(
      "react search",
    );
    expect(
      resolveSearchQueryFromLocationSearch("?search=next%20blog", "search", 100),
    ).toBe("next blog");
    expect(resolveSearchQueryFromLocationSearch("?q=abcdefghij", "q", 6)).toBe(
      "abcdef",
    );
  });
});
