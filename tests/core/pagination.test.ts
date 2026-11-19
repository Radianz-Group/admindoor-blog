import { describe, expect, it } from "vitest";

import {
  getPageNumbers,
  getPostsForPage,
  getTotalPages,
  isValidPage,
  parsePageNumber,
} from "../../src/core/pagination";

describe("getTotalPages", () => {
  it("returns 1 when there are no posts", () => {
    expect(getTotalPages(0)).toBe(1);
  });

  it("returns 1 for negative totals", () => {
    expect(getTotalPages(-3)).toBe(1);
  });

  it("ceil-divides with the default page size", () => {
    expect(getTotalPages(12)).toBe(1);
    expect(getTotalPages(13)).toBe(2);
    expect(getTotalPages(24)).toBe(2);
    expect(getTotalPages(25)).toBe(3);
  });

  it("respects a custom postsPerPage", () => {
    expect(getTotalPages(25, 10)).toBe(3);
    expect(getTotalPages(20, 10)).toBe(2);
  });
});

describe("getPostsForPage", () => {
  const posts = Array.from({ length: 25 }, (_, index) => index + 1);

  it("returns the correct slice for page 1", () => {
    expect(getPostsForPage(posts, 1)).toEqual(
      Array.from({ length: 12 }, (_, i) => i + 1),
    );
  });

  it("returns the correct slice for page 2", () => {
    expect(getPostsForPage(posts, 2)).toEqual(
      Array.from({ length: 12 }, (_, i) => i + 13),
    );
  });

  it("returns a partial last page", () => {
    expect(getPostsForPage(posts, 3)).toEqual([25]);
  });

  it("returns an empty array for out-of-range pages", () => {
    expect(getPostsForPage(posts, 4)).toEqual([]);
  });

  it("respects a custom postsPerPage", () => {
    expect(getPostsForPage(posts, 2, 10)).toEqual([
      11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    ]);
  });
});

describe("parsePageNumber", () => {
  it("parses valid page strings", () => {
    expect(parsePageNumber("1")).toBe(1);
    expect(parsePageNumber("42")).toBe(42);
  });

  it("returns null for invalid values", () => {
    expect(parsePageNumber("0")).toBeNull();
    expect(parsePageNumber("-1")).toBeNull();
    expect(parsePageNumber("abc")).toBeNull();
    expect(parsePageNumber("")).toBeNull();
  });
});

describe("isValidPage", () => {
  it("accepts pages within bounds", () => {
    expect(isValidPage(1, 3)).toBe(true);
    expect(isValidPage(3, 3)).toBe(true);
  });

  it("rejects pages outside bounds", () => {
    expect(isValidPage(0, 3)).toBe(false);
    expect(isValidPage(4, 3)).toBe(false);
  });
});

describe("getPageNumbers", () => {
  it("shows all pages when totalPages is 7 or fewer", () => {
    expect(getPageNumbers(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getPageNumbers(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("collapses distant pages when totalPages exceeds 7", () => {
    expect(getPageNumbers(5, 10)).toEqual([1, 4, 5, 6, 10]);
    expect(getPageNumbers(1, 10)).toEqual([1, 2, 10]);
    expect(getPageNumbers(10, 10)).toEqual([1, 9, 10]);
  });
});
