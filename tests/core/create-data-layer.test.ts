import { afterEach, describe, expect, it, vi } from "vitest";

import sampleResponse from "../fixtures/admindoor/sample-response.json";
import type { BlogConfig } from "../../src/core/config-schema";
import { createBlogDataLayer } from "../../src/core/create-data-layer";
import type { BlogContentSource, BlogPost } from "../../src/core/types";

const baseConfig: BlogConfig = {
  site: { name: "Test Site", url: "https://example.com" },
  content: { type: "admindoor", apiUrl: "https://api.example.com/blogs" },
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("createBlogDataLayer", () => {
  it("returns sorted posts from an admindoor source", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => sampleResponse,
      }),
    );

    const layer = createBlogDataLayer(baseConfig);
    const posts = await layer.getAllPosts();

    expect(posts.map((post) => post.slug)).toEqual(["second-post", "first-post"]);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("https://api.example.com/blogs", {
      cache: "no-store",
    });
  });

  it("caches posts after the first fetch", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => sampleResponse,
    });
    vi.stubGlobal("fetch", fetchMock);

    const layer = createBlogDataLayer(baseConfig);

    await layer.getAllPosts();
    await layer.getAllPosts();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("deduplicates concurrent fetches", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => sampleResponse,
    });
    vi.stubGlobal("fetch", fetchMock);

    const layer = createBlogDataLayer(baseConfig);

    await Promise.all([layer.getAllPosts(), layer.getAllPosts(), layer.getAllPosts()]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("finds a post by slug", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => sampleResponse,
      }),
    );

    const layer = createBlogDataLayer(baseConfig);
    const post = await layer.getPostBySlug("first-post");

    expect(post?.title).toBe("First Post");
    expect(await layer.getPostBySlug("missing")).toBeUndefined();
  });

  it("uses the config locale for date formatting", async () => {
    const customPosts: BlogPost[] = [
      {
        slug: "dated-post",
        title: "Dated Post",
        excerpt: "Excerpt",
        content: "<p>Content</p>",
        publishedAt: "2024-06-15T00:00:00.000Z",
      },
    ];

    const source: BlogContentSource = {
      getPosts: async () => customPosts,
    };

    const layer = createBlogDataLayer({
      ...baseConfig,
      locale: "en-US",
      content: source,
    });

    expect(layer.formatPostDate("2024-06-15T00:00:00.000Z")).toBe("June 15, 2024");
  });
});
