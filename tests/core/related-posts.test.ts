import { describe, expect, it } from "vitest";

import type { BlogPost } from "../../src/core/types";
import {
  parseRelatedSlugsFromTags,
  resolveRelatedPosts,
} from "../../src/core/related-posts";

function makePost(slug: string, tags?: string[]): BlogPost {
  return {
    slug,
    title: slug,
    excerpt: "",
    content: "",
    publishedAt: "2024-01-01T00:00:00.000Z",
    seo: tags ? { tags } : undefined,
  };
}

describe("parseRelatedSlugsFromTags", () => {
  it("extracts slugs from related: tags", () => {
    expect(
      parseRelatedSlugsFromTags([
        "finance",
        "related:the-complete-msme-loan-guide-for-indian-businesses-in-2026",
        "related:second-post",
      ]),
    ).toEqual([
      "the-complete-msme-loan-guide-for-indian-businesses-in-2026",
      "second-post",
    ]);
  });

  it("skips empty slugs and deduplicates while preserving order", () => {
    expect(
      parseRelatedSlugsFromTags([
        "related:",
        "related:   ",
        "related:alpha",
        "related:alpha",
        "related:beta",
      ]),
    ).toEqual(["alpha", "beta"]);
  });

  it("returns an empty array when tags are missing or have no related entries", () => {
    expect(parseRelatedSlugsFromTags()).toEqual([]);
    expect(parseRelatedSlugsFromTags(["finance", "advisory"])).toEqual([]);
  });

  it("matches the related: prefix case-sensitively", () => {
    expect(parseRelatedSlugsFromTags(["Related:ignored", "related:kept"])).toEqual([
      "kept",
    ]);
  });
});

describe("resolveRelatedPosts", () => {
  const allPosts = [
    makePost("first-post"),
    makePost("second-post"),
    makePost("third-post"),
  ];

  it("resolves posts in tag order and skips missing slugs", () => {
    const current = makePost("first-post", [
      "related:missing-slug",
      "related:third-post",
      "related:second-post",
    ]);

    expect(resolveRelatedPosts(current, allPosts).map((post) => post.slug)).toEqual([
      "third-post",
      "second-post",
    ]);
  });

  it("excludes the current post when referenced by a related tag", () => {
    const current = makePost("first-post", [
      "related:first-post",
      "related:second-post",
    ]);

    expect(resolveRelatedPosts(current, allPosts).map((post) => post.slug)).toEqual([
      "second-post",
    ]);
  });

  it("returns an empty array when no valid related posts remain", () => {
    const current = makePost("first-post", ["related:missing", "finance"]);

    expect(resolveRelatedPosts(current, allPosts)).toEqual([]);
  });
});
