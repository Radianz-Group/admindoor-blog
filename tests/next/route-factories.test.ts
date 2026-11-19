import { describe, expect, it } from "vitest";

import { createBlogConfig } from "../../src/next/create-blog-config";
import { getBlogRedirects } from "../../src/next/redirects";

const baseInput = {
  site: { name: "Test Site", url: "https://www.example.com" },
  content: { type: "admindoor" as const, apiUrl: "https://api.example.com/blogs" },
};

describe("createBlogConfig", () => {
  it("parses input and applies defaults", () => {
    const config = createBlogConfig(baseInput);

    expect(config.locale).toBe("en-IN");
    expect(config.listing?.postsPerPage).toBe(12);
    expect(config.site.name).toBe("Test Site");
  });

  it("preserves explicit listing and locale overrides", () => {
    const config = createBlogConfig({
      ...baseInput,
      locale: "en-US",
      listing: {
        postsPerPage: 6,
        title: "News",
      },
    });

    expect(config.locale).toBe("en-US");
    expect(config.listing?.postsPerPage).toBe(6);
    expect(config.listing?.title).toBe("News");
  });
});

describe("getBlogRedirects", () => {
  it("redirects the blog base path to listing page 1", () => {
    const config = createBlogConfig(baseInput);

    expect(getBlogRedirects(config)).toEqual([
      {
        source: "/blog",
        destination: "/blog/p/1",
        permanent: true,
      },
    ]);
  });

  it("respects custom route paths", () => {
    const config = createBlogConfig({
      ...baseInput,
      routes: {
        basePath: "/articles",
        listingPath: "/articles/page",
      },
    });

    expect(getBlogRedirects(config)).toEqual([
      {
        source: "/articles",
        destination: "/articles/page/1",
        permanent: true,
      },
    ]);
  });

  it("only redirects a search-enabled blog when the query is absent", () => {
    const config = createBlogConfig({
      ...baseInput,
      search: { enabled: true, queryParam: "search" },
    });

    expect(getBlogRedirects(config)).toEqual([
      {
        source: "/blog",
        destination: "/blog/p/1",
        permanent: true,
        missing: [{ type: "query", key: "search" }],
      },
    ]);
  });
});

describe("createBlogConfig share options", () => {
  it("accepts share and utm options and keeps functions", () => {
    const getUrl = (_post: unknown, url: string) => url;
    const config = createBlogConfig({
      ...baseInput,
      postPage: {
        share: {
          enabled: true,
          platforms: ["whatsapp", "email"],
          getUrl,
          utm: { campaign: "c", content: () => "x", sources: { x: "twitter" } },
        },
      },
    });

    expect(config.postPage?.share?.platforms).toEqual(["whatsapp", "email"]);
    expect(config.postPage?.share?.getUrl).toBe(getUrl);
    expect(typeof config.postPage?.share?.utm?.content).toBe("function");
  });

  it("rejects invalid share options", () => {
    expect(() =>
      createBlogConfig({
        ...baseInput,
        postPage: { share: { platforms: ["myspace" as never] } },
      }),
    ).toThrow();
    expect(() =>
      createBlogConfig({
        ...baseInput,
        postPage: { share: { getUrl: "nope" as never } },
      }),
    ).toThrow();
    expect(() =>
      createBlogConfig({
        ...baseInput,
        postPage: { share: { utm: { sources: { bogus: "x" } as never } } },
      }),
    ).toThrow();
  });
});
