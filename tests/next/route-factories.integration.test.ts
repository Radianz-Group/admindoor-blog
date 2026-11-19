import { afterEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import sampleResponse from "../fixtures/admindoor/sample-response.json";
import { createBlogConfig } from "../../src/next/create-blog-config";
import { createBlogListingPage } from "../../src/next/create-listing-page";
import { createBlogPostPage } from "../../src/next/create-post-page";
import { createBlogSearchPage } from "../../src/next/create-search-page";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const rest = { ...props };
    delete rest.fill;
    delete rest.priority;
    return React.createElement("img", rest);
  },
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => React.createElement("a", { href, ...rest }, children),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

const config = createBlogConfig({
  site: { name: "Test Site", url: "https://www.example.com" },
  content: { type: "admindoor", apiUrl: "https://api.example.com/blogs" },
  listing: { title: "Blog", subtitle: "Latest posts" },
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("route factories", () => {
  it("shares one data layer cache across listing and post factories", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => sampleResponse,
    });
    vi.stubGlobal("fetch", fetchMock);

    const listing = createBlogListingPage(config);
    const post = createBlogPostPage(config);

    await listing.generateStaticParams();
    await post.generateStaticParams();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("generates listing static params with at least one page", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => sampleResponse,
      }),
    );

    const listing = createBlogListingPage(config);
    const params = await listing.generateStaticParams();

    expect(params.length).toBeGreaterThanOrEqual(1);
    expect(params[0]).toEqual({ page: "1" });
  });

  it("generates post static params from fetched slugs", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => sampleResponse,
      }),
    );

    const post = createBlogPostPage(config);
    const params = await post.generateStaticParams();

    expect(params.map((entry) => entry.slug).sort()).toEqual([
      "first-post",
      "second-post",
    ]);
  });

  it("builds listing metadata for a valid page", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => sampleResponse,
      }),
    );

    const listing = createBlogListingPage(config);
    const metadata = await listing.generateMetadata({
      params: Promise.resolve({ page: "1" }),
    });

    expect(metadata).toMatchObject({
      title: "Blog - Test Site",
      description: "Latest posts",
      alternates: { canonical: "/blog/p/1" },
    });
  });

  it("renders related posts when valid related: tags resolve", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => sampleResponse,
      }),
    );

    const post = createBlogPostPage(config);
    const element = await post.default({
      params: Promise.resolve({ slug: "first-post" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Related posts");
    expect(html).toContain("Second Post");
  });

  it("omits related posts when no valid related: tags resolve", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => sampleResponse,
      }),
    );

    const post = createBlogPostPage(config);
    const element = await post.default({
      params: Promise.resolve({ slug: "second-post" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).not.toContain("Related posts");
  });

  it("builds static search metadata without searchParams", async () => {
    const searchConfig = createBlogConfig({
      site: { name: "Test Site", url: "https://www.example.com" },
      content: { type: "admindoor", apiUrl: "https://api.example.com/blogs" },
      search: { enabled: true },
    });
    const search = createBlogSearchPage(searchConfig);
    const metadata = await search.generateMetadata();

    expect(metadata).toMatchObject({
      title: "Search - Test Site",
      robots: { index: false, follow: true },
    });
  });

  it("renders the search shell without redirecting when the query is absent", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => sampleResponse,
      }),
    );

    const searchConfig = createBlogConfig({
      site: { name: "Test Site", url: "https://www.example.com" },
      content: { type: "admindoor", apiUrl: "https://api.example.com/blogs" },
      search: { enabled: true },
    });
    const search = createBlogSearchPage(searchConfig);
    const element = await search.default();
    const html = renderToStaticMarkup(element);

    expect(html).toContain('role="search"');
    expect(html).toContain("Search articles");
  });

  it("renders the share button on the post page by default", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => sampleResponse }),
    );

    const post = createBlogPostPage(config);
    const html = renderToStaticMarkup(
      await post.default({ params: Promise.resolve({ slug: "first-post" }) }),
    );

    expect(html).toContain('data-slot="blog-share-trigger"');
    expect(html).toContain("Share");
  });

  it("omits the share button when share is disabled", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => sampleResponse }),
    );

    const disabled = createBlogConfig({
      site: { name: "Test Site", url: "https://www.example.com" },
      content: { type: "admindoor", apiUrl: "https://api.example.com/blogs" },
      postPage: { share: { enabled: false } },
    });
    const html = renderToStaticMarkup(
      await createBlogPostPage(disabled).default({
        params: Promise.resolve({ slug: "first-post" }),
      }),
    );

    expect(html).not.toContain("blog-share-trigger");
  });

  it("applies class name overrides to the byline and share trigger", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => sampleResponse }),
    );

    const post = createBlogPostPage(config, {
      ui: {
        classNames: {
          meta: "meta-override",
          date: "date-override",
          share: { trigger: "trigger-override" },
        },
      },
    });
    const html = renderToStaticMarkup(
      await post.default({ params: Promise.resolve({ slug: "first-post" }) }),
    );

    expect(html).toContain("meta-override");
    expect(html).toContain("date-override");
    expect(html).toContain("trigger-override");
  });
});
