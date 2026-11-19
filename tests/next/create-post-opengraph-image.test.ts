import { describe, expect, it, vi } from "vitest";

import type { BlogConfig } from "../../src/core/config-schema";
import {
  BLOG_OG_IMAGE_CONTENT_TYPE,
  BLOG_OG_IMAGE_SIZE,
  createBlogPostOpengraphImage,
} from "../../src/next/create-post-opengraph-image";

const testConfig: BlogConfig = {
  site: {
    name: "Test Site",
    url: "https://www.example.com",
    logoUrl: "https://www.example.com/logo.png",
  },
  content: {
    getPosts: async () => [
      {
        slug: "with-cover",
        title: "With Cover",
        excerpt: "Has a cover image.",
        content: "<p>Hello</p>",
        publishedAt: "2024-01-15T00:00:00.000Z",
        imageUrl: "https://cdn.example.com/cover.png",
        seo: {
          featuredImage: "https://cdn.example.com/cover.png",
        },
      },
      {
        slug: "no-cover",
        title: "No Cover",
        excerpt: "Missing cover image.",
        content: "<p>Hello</p>",
        publishedAt: "2024-01-16T00:00:00.000Z",
      },
    ],
  },
};

describe("createBlogPostOpengraphImage", () => {
  it("exports standard OG image dimensions and JPEG content type", () => {
    expect(BLOG_OG_IMAGE_SIZE).toEqual({ width: 1200, height: 630 });
    expect(BLOG_OG_IMAGE_CONTENT_TYPE).toBe("image/jpeg");
  });

  it("returns an optimized JPEG when the cover can be fetched", async () => {
    const png1x1 = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64",
    );

    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(png1x1, {
            status: 200,
            headers: { "Content-Type": "image/png" },
          }),
      ),
    );

    const handler = createBlogPostOpengraphImage(testConfig);
    const response = await handler({
      params: Promise.resolve({ slug: "with-cover" }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/jpeg");
    const bytes = Buffer.from(await response.arrayBuffer());
    expect(bytes.byteLength).toBeGreaterThan(0);
    // JPEG magic number
    expect(bytes[0]).toBe(0xff);
    expect(bytes[1]).toBe(0xd8);

    vi.unstubAllGlobals();
  });

  it("returns a generated card when the post has no cover", async () => {
    const handler = createBlogPostOpengraphImage(testConfig);
    const response = await handler({
      params: Promise.resolve({ slug: "no-cover" }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toMatch(/image\/(png|jpeg)/);
    expect((await response.arrayBuffer()).byteLength).toBeGreaterThan(0);
  });
});
