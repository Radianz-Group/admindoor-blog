import { describe, expect, it } from "vitest";

import type { BlogConfig } from "../../src/core/config-schema";
import {
  getBlogBasePath,
  getBlogSearchUrl,
  getListingBasePath,
  getListingPageUrl,
  getPostShareUrl,
  getPostShareUtm,
  getPostUrl,
} from "../../src/next/paths";

const baseConfig: BlogConfig = {
  site: { name: "Test Site", url: "https://example.com" },
  content: { type: "admindoor", apiUrl: "https://api.example.com/blogs" },
};

describe("path helpers", () => {
  it("uses default base and listing paths", () => {
    expect(getBlogBasePath(baseConfig)).toBe("/blog");
    expect(getListingBasePath(baseConfig)).toBe("/blog/p");
    expect(getPostUrl(baseConfig, "hello-world")).toBe("/blog/hello-world");
    expect(getListingPageUrl(baseConfig, 2)).toBe("/blog/p/2");
    expect(getBlogSearchUrl(baseConfig, "react search")).toBe("/blog?q=react+search");
  });

  it("respects custom route paths", () => {
    const config: BlogConfig = {
      ...baseConfig,
      routes: { basePath: "/articles", listingPath: "/articles/page" },
    };

    expect(getBlogBasePath(config)).toBe("/articles");
    expect(getListingBasePath(config)).toBe("/articles/page");
    expect(getPostUrl(config, "my-post")).toBe("/articles/my-post");
    expect(getListingPageUrl(config, 3)).toBe("/articles/page/3");
    expect(getBlogSearchUrl(config, "next")).toBe("/articles?q=next");
  });

  it("normalizes paths without a leading slash and trailing slashes", () => {
    const config: BlogConfig = {
      ...baseConfig,
      routes: { basePath: "news/", listingPath: "news/pages/" },
    };

    expect(getBlogBasePath(config)).toBe("/news");
    expect(getListingBasePath(config)).toBe("/news/pages");
  });
});

describe("getPostShareUrl", () => {
  const post = { slug: "hello" } as Parameters<typeof getPostShareUrl>[1];

  it("defaults to site url plus post path", () => {
    expect(getPostShareUrl(baseConfig, post)).toBe("https://example.com/blog/hello");
  });

  it("trims a trailing slash on site url and respects a custom base path", () => {
    const config: BlogConfig = {
      ...baseConfig,
      site: { ...baseConfig.site, url: "https://example.com/" },
      routes: { basePath: "/articles" },
    };
    expect(getPostShareUrl(config, post)).toBe("https://example.com/articles/hello");
  });

  it("uses the getUrl result and passes post and default url", () => {
    const config: BlogConfig = {
      ...baseConfig,
      postPage: { share: { getUrl: (p, url) => `${url}?from=${p.slug}` } },
    };
    expect(getPostShareUrl(config, post)).toBe(
      "https://example.com/blog/hello?from=hello",
    );
  });

  it("falls back to the default when getUrl returns a blank string", () => {
    const config: BlogConfig = {
      ...baseConfig,
      postPage: { share: { getUrl: () => "  " } },
    };
    expect(getPostShareUrl(config, post)).toBe("https://example.com/blog/hello");
  });
});

describe("getPostShareUtm", () => {
  const post = { slug: "hello" } as Parameters<typeof getPostShareUtm>[1];

  it("is off by default", () => {
    expect(getPostShareUtm(baseConfig, post)).toBeUndefined();
  });

  it("is toggled by utm.enabled and defaults content to the slug", () => {
    const off: BlogConfig = {
      ...baseConfig,
      postPage: { share: { utm: { enabled: false, campaign: "spring" } } },
    };
    const on: BlogConfig = {
      ...baseConfig,
      postPage: { share: { utm: { enabled: true } } },
    };
    expect(getPostShareUtm(off, post)).toBeUndefined();
    expect(getPostShareUtm(on, post)).toMatchObject({ content: "hello" });
  });

  it("resolves string and function content and passes other settings through", () => {
    const fn: BlogConfig = {
      ...baseConfig,
      postPage: {
        share: {
          utm: {
            enabled: true,
            campaign: "spring",
            medium: "referral",
            term: "t",
            sources: { x: "twitter" },
            content: (p) => `c-${p.slug}`,
          },
        },
      },
    };
    expect(getPostShareUtm(fn, post)).toMatchObject({
      content: "c-hello",
      campaign: "spring",
      medium: "referral",
      term: "t",
      sources: { x: "twitter" },
    });
    const str: BlogConfig = {
      ...baseConfig,
      postPage: { share: { utm: { enabled: true, content: "fixed" } } },
    };
    expect(getPostShareUtm(str, post)?.content).toBe("fixed");
  });
});
