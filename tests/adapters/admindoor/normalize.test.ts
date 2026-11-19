import { describe, expect, it } from "vitest";

import sampleResponse from "../../fixtures/admindoor/sample-response.json";
import type { AdmindoorContentResponse } from "../../../src/adapters/admindoor/api-types";
import {
  normalizeAdmindoorPost,
  sortPostsByDate,
} from "../../../src/adapters/admindoor/normalize";

describe("normalizeAdmindoorPost", () => {
  const response = sampleResponse as AdmindoorContentResponse;
  const [firstRaw, secondRaw, invalidRaw] = response.blogs ?? [];

  it("normalizes a full post from the fixture", () => {
    const post = normalizeAdmindoorPost(firstRaw);

    expect(post).toMatchObject({
      slug: "first-post",
      title: "First Post",
      excerpt: "An introductory article about structured finance.",
      publishedAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-02-01T00:00:00.000Z",
      imageUrl: "https://cdn.example.com/featured.jpg",
      author: "Jane Doe",
      authorImage: "https://cdn.example.com/jane.jpg",
      authorAbout: "Finance writer",
    });
    expect(post?.content).toContain("<p>Hello world.</p>");
    expect(post?.seo).toMatchObject({
      title: "First Post SEO Title",
      tags: ["finance", "advisory", "related:second-post"],
      keyTakeaways: ["Point one", "Point two"],
      robotsIndex: true,
    });
    expect(post?.seo?.faqs).toEqual([
      {
        question: "What is this post about?",
        answer: "Structured finance basics.",
      },
    ]);
  });

  it("normalizes TipTap links with HTTPS-only sanitization", () => {
    const post = normalizeAdmindoorPost(secondRaw);

    expect(post).toMatchObject({
      slug: "second-post",
      title: "Second Post",
    });
    expect(post?.content).toContain("<h2>Section heading</h2>");
    expect(post?.content).toContain('href="https://example.com/resource"');
    expect(post?.content).toContain('rel="noopener noreferrer nofollow"');
    expect(post?.updatedAt).toBeUndefined();
  });

  it("returns null for invalid posts", () => {
    expect(normalizeAdmindoorPost(invalidRaw)).toBeNull();
    expect(normalizeAdmindoorPost({})).toBeNull();
  });
});

describe("sortPostsByDate", () => {
  it("sorts posts newest first", () => {
    const response = sampleResponse as AdmindoorContentResponse;
    const posts = (response.blogs ?? [])
      .map((item) => normalizeAdmindoorPost(item))
      .filter((post): post is NonNullable<typeof post> => post !== null);

    const sorted = sortPostsByDate(posts);

    expect(sorted.map((post) => post.slug)).toEqual(["second-post", "first-post"]);
  });
});
