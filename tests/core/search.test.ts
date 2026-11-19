import { describe, expect, it } from "vitest";

import type { BlogPost } from "../../src/core/types";
import {
  buildSearchIndex,
  buildSearchRecords,
  searchPosts,
  type BlogSearchFieldWeights,
} from "../../src/core/search";

const weights: BlogSearchFieldWeights = {
  title: 2,
  tags: 1,
  primaryTopic: 1,
  excerpt: 1,
};

const posts: BlogPost[] = [
  {
    slug: "title-match",
    title: "React search",
    excerpt: "A practical guide",
    content: "",
    publishedAt: "2025-01-01",
    seo: { tags: ["frontend"], primaryTopic: "Engineering" },
  },
  {
    slug: "field-match",
    title: "Frontend patterns",
    excerpt: "Search patterns for applications",
    content: "",
    publishedAt: "2026-01-01",
    seo: { tags: ["react"], primaryTopic: "Engineering" },
  },
];

describe("blog search", () => {
  it("ranks matches using field weights", async () => {
    const index = await buildSearchIndex(buildSearchRecords(posts), weights);
    expect((await searchPosts(index, "search")).map((post) => post.slug)).toEqual([
      "title-match",
      "field-match",
    ]);
  });

  it("requires every query term to match somewhere in a post", async () => {
    const index = await buildSearchIndex(buildSearchRecords(posts), weights);
    expect(
      (await searchPosts(index, "react practical")).map((post) => post.slug),
    ).toEqual(["title-match"]);
  });

  it("allows terms to match across different fields", async () => {
    const index = await buildSearchIndex(buildSearchRecords(posts), weights);
    expect(
      (await searchPosts(index, "react applications")).map((post) => post.slug),
    ).toEqual(["field-match"]);
  });

  it("uses publication date to break equal-score ties", async () => {
    const index = await buildSearchIndex(buildSearchRecords(posts), weights);
    expect((await searchPosts(index, "engineering")).map((post) => post.slug)).toEqual([
      "field-match",
      "title-match",
    ]);
  });

  it("ignores stop words while keeping meaningful terms searchable", async () => {
    const index = await buildSearchIndex(buildSearchRecords(posts), weights);
    expect((await searchPosts(index, "the")).map((post) => post.slug)).toEqual([]);
    expect((await searchPosts(index, "the react")).map((post) => post.slug)).toEqual([
      "title-match",
      "field-match",
    ]);
  });
});
