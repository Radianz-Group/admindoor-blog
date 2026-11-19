import { describe, expect, it } from "vitest";

import { normalizeAdmindoorPost } from "../../src/adapters/admindoor/normalize";
import sampleResponse from "../fixtures/admindoor/sample-response.json";
import type { AdmindoorContentResponse } from "../../src/adapters/admindoor/api-types";
import type { BlogConfig } from "../../src/core/config-schema";
import { buildListingMetadata } from "../../src/seo/listing-metadata";
import { buildBlogPostMetadata } from "../../src/seo/metadata";
import { serializeJsonLd } from "../../src/seo/helpers";
import { generateBlogSitemapEntries } from "../../src/seo/sitemap";
import {
  buildBlogPostStructuredData,
  buildListingStructuredData,
  buildOrganizationStructuredData,
  buildWebsiteStructuredData,
} from "../../src/seo/structured-data";

const testConfig: BlogConfig = {
  site: {
    name: "Test Site",
    url: "https://www.example.com",
    logoUrl: "https://www.example.com/logo.png",
    description: "Expert perspectives on finance and advisory.",
    legalName: "Test Site LLC",
    sameAs: [
      "https://twitter.com/testsite",
      "https://www.linkedin.com/company/testsite",
    ],
    logoWidth: 512,
    logoHeight: 512,
    twitterHandle: "@testsite",
  },
  content: { type: "admindoor", apiUrl: "https://api.example.com/blogs" },
  listing: {
    title: "Insights & Updates",
    subtitle: "Expert perspectives on finance and advisory.",
    postsPerPage: 12,
  },
};

const testPost = normalizeAdmindoorPost(
  (sampleResponse as AdmindoorContentResponse).blogs![0],
)!;

describe("serializeJsonLd", () => {
  it("escapes less-than characters for safe script embedding", () => {
    expect(serializeJsonLd({ name: "</script><script>alert(1)</script>" })).toBe(
      '{"name":"\\u003c/script>\\u003cscript>alert(1)\\u003c/script>"}',
    );
  });
});

describe("buildOrganizationStructuredData", () => {
  it("builds a config-driven Organization schema", () => {
    expect(buildOrganizationStructuredData(testConfig)).toEqual({
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": "https://www.example.com#organization",
      name: "Test Site",
      url: "https://www.example.com",
      legalName: "Test Site LLC",
      description: "Expert perspectives on finance and advisory.",
      logo: {
        "@type": "ImageObject",
        url: "https://www.example.com/logo.png",
        width: 512,
        height: 512,
      },
      sameAs: [
        "https://twitter.com/testsite",
        "https://www.linkedin.com/company/testsite",
      ],
    });
  });
});

describe("buildWebsiteStructuredData", () => {
  it("builds a WebSite schema linked to Organization by @id", () => {
    expect(buildWebsiteStructuredData(testConfig)).toEqual({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": "https://www.example.com#website",
      name: "Test Site",
      url: "https://www.example.com",
      description: "Expert perspectives on finance and advisory.",
      publisher: {
        "@id": "https://www.example.com#organization",
      },
    });
  });
});

describe("buildBlogPostMetadata", () => {
  it("builds config-driven post metadata", () => {
    expect(buildBlogPostMetadata(testConfig, testPost)).toMatchInlineSnapshot(`
      {
        "alternates": {
          "canonical": "/blog/first-post",
        },
        "description": "SEO description for the first post.",
        "keywords": [
          "finance",
          "advisory",
        ],
        "metadataBase": "https://www.example.com/",
        "openGraph": {
          "authors": [
            "Jane Doe",
          ],
          "description": "SEO description for the first post.",
          "images": [
            {
              "alt": "First Post",
              "height": 630,
              "url": "/blog/first-post/opengraph-image",
              "width": 1200,
            },
          ],
          "modifiedTime": "2024-02-01T00:00:00.000Z",
          "publishedTime": "2024-01-15T00:00:00.000Z",
          "siteName": "Test Site",
          "tags": [
            "finance",
            "advisory",
          ],
          "title": "First Post SEO Title",
          "type": "article",
          "url": "https://www.example.com/blog/first-post",
        },
        "title": "First Post SEO Title - Test Site",
        "twitter": {
          "card": "summary_large_image",
          "description": "SEO description for the first post.",
          "images": [
            "/blog/first-post/opengraph-image",
          ],
          "site": "@testsite",
          "title": "First Post SEO Title",
        },
      }
    `);
  });

  it("always emits og:image even when the post has no featured image", () => {
    const postWithoutSeo = normalizeAdmindoorPost(
      (sampleResponse as AdmindoorContentResponse).blogs![1],
    )!;

    expect(buildBlogPostMetadata(testConfig, postWithoutSeo)).toMatchObject({
      title: "Second Post - Test Site",
      description: "A newer article with rich content.",
      openGraph: {
        title: "Second Post",
        description: "A newer article with rich content.",
        type: "article",
        url: "https://www.example.com/blog/second-post",
        siteName: "Test Site",
        images: [
          {
            url: "/blog/second-post/opengraph-image",
            width: 1200,
            height: 630,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "Second Post",
        description: "A newer article with rich content.",
        images: ["/blog/second-post/opengraph-image"],
        site: "@testsite",
      },
    });
  });
});

describe("buildBlogPostStructuredData", () => {
  it("falls back to opengraph-image URL when the post has no featured image", () => {
    const postWithoutCover = normalizeAdmindoorPost(
      (sampleResponse as AdmindoorContentResponse).blogs![1],
    )!;

    const [article] = buildBlogPostStructuredData(testConfig, postWithoutCover);
    expect(article.image).toEqual([
      "https://www.example.com/blog/second-post/opengraph-image",
    ]);
  });

  it("builds config-driven JSON-LD schemas", () => {
    expect(buildBlogPostStructuredData(testConfig, testPost)).toMatchInlineSnapshot(`
      [
        {
          "@context": "https://schema.org",
          "@id": "https://www.example.com/blog/first-post#article",
          "@type": "Article",
          "author": {
            "@type": "Person",
            "image": "https://cdn.example.com/jane.jpg",
            "name": "Jane Doe",
          },
          "dateModified": "2024-02-01T00:00:00.000Z",
          "datePublished": "2024-01-15T00:00:00.000Z",
          "description": "SEO description for the first post.",
          "hasPart": [
            {
              "@type": "CreativeWork",
              "name": "Key takeaway",
              "text": "Point one",
            },
            {
              "@type": "CreativeWork",
              "name": "Key takeaway",
              "text": "Point two",
            },
          ],
          "headline": "First Post SEO Title",
          "image": [
            "https://cdn.example.com/featured.jpg",
          ],
          "inLanguage": "en",
          "isPartOf": {
            "@id": "https://www.example.com/blog/p/1#blog",
            "@type": "Blog",
            "name": "Insights & Updates",
            "url": "https://www.example.com/blog/p/1",
          },
          "keywords": "finance, advisory",
          "mainEntityOfPage": {
            "@id": "https://www.example.com/blog/first-post",
            "@type": "WebPage",
          },
          "publisher": {
            "@id": "https://www.example.com#organization",
            "@type": "Organization",
            "logo": {
              "@type": "ImageObject",
              "height": 512,
              "url": "https://www.example.com/logo.png",
              "width": 512,
            },
            "name": "Test Site",
            "url": "https://www.example.com",
          },
          "url": "https://www.example.com/blog/first-post",
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "item": "https://www.example.com/",
              "name": "Home",
              "position": 1,
            },
            {
              "@type": "ListItem",
              "item": "https://www.example.com/blog/p/1",
              "name": "Insights & Updates",
              "position": 2,
            },
            {
              "@type": "ListItem",
              "item": "https://www.example.com/blog/first-post",
              "name": "First Post SEO Title",
              "position": 3,
            },
          ],
        },
        {
          "@context": "https://schema.org",
          "@id": "https://www.example.com/blog/first-post#faq",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Structured finance basics.",
              },
              "name": "What is this post about?",
            },
          ],
        },
      ]
    `);
  });
});

describe("buildListingStructuredData", () => {
  it("builds CollectionPage JSON-LD with post ItemList", () => {
    const posts = [
      testPost,
      normalizeAdmindoorPost((sampleResponse as AdmindoorContentResponse).blogs![1])!,
    ];

    expect(buildListingStructuredData(testConfig, posts, 1)).toMatchObject([
      {
        "@type": "CollectionPage",
        name: "Insights & Updates",
        description: "Expert perspectives on finance and advisory.",
        url: "https://www.example.com/blog/p/1",
        isPartOf: {
          "@type": "WebSite",
          "@id": "https://www.example.com#website",
          name: "Test Site",
          url: "https://www.example.com",
          publisher: {
            "@id": "https://www.example.com#organization",
          },
        },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              url: "https://www.example.com/blog/first-post",
              name: "First Post SEO Title",
            },
            {
              "@type": "ListItem",
              position: 2,
              url: "https://www.example.com/blog/second-post",
              name: "Second Post",
            },
          ],
        },
      },
    ]);
  });
});

describe("buildListingMetadata", () => {
  it("builds listing metadata for page 1", () => {
    expect(buildListingMetadata(testConfig, 1, 2)).toMatchInlineSnapshot(`
      {
        "alternates": {
          "canonical": "/blog/p/1",
          "next": "/blog/p/2",
        },
        "description": "Expert perspectives on finance and advisory.",
        "metadataBase": "https://www.example.com/",
        "openGraph": {
          "description": "Expert perspectives on finance and advisory.",
          "images": [
            {
              "alt": "Test Site logo",
              "height": 512,
              "url": "https://www.example.com/logo.png",
              "width": 512,
            },
          ],
          "siteName": "Test Site",
          "title": "Insights & Updates",
          "type": "website",
          "url": "https://www.example.com/blog/p/1",
        },
        "title": "Insights & Updates - Test Site",
        "twitter": {
          "card": "summary_large_image",
          "description": "Expert perspectives on finance and advisory.",
          "images": [
            "https://www.example.com/logo.png",
          ],
          "site": "@testsite",
          "title": "Insights & Updates",
        },
      }
    `);
  });

  it("builds paginated listing metadata", () => {
    expect(buildListingMetadata(testConfig, 2, 2)).toMatchInlineSnapshot(`
      {
        "alternates": {
          "canonical": "/blog/p/2",
          "prev": "/blog/p/1",
        },
        "description": "Expert perspectives on finance and advisory.",
        "metadataBase": "https://www.example.com/",
        "openGraph": {
          "description": "Expert perspectives on finance and advisory.",
          "images": [
            {
              "alt": "Test Site logo",
              "height": 512,
              "url": "https://www.example.com/logo.png",
              "width": 512,
            },
          ],
          "siteName": "Test Site",
          "title": "Insights & Updates — Page 2",
          "type": "website",
          "url": "https://www.example.com/blog/p/2",
        },
        "title": "Insights & Updates — Page 2 - Test Site",
        "twitter": {
          "card": "summary_large_image",
          "description": "Expert perspectives on finance and advisory.",
          "images": [
            "https://www.example.com/logo.png",
          ],
          "site": "@testsite",
          "title": "Insights & Updates — Page 2",
        },
      }
    `);
  });
});

describe("generateBlogSitemapEntries", () => {
  it("includes listing pages and posts with absolute URLs", () => {
    const posts = [
      testPost,
      normalizeAdmindoorPost((sampleResponse as AdmindoorContentResponse).blogs![1])!,
    ];

    expect(generateBlogSitemapEntries(testConfig, posts)).toEqual([
      { url: "https://www.example.com/blog/p/1" },
      {
        url: "https://www.example.com/blog/first-post",
        lastModified: "2024-02-01T00:00:00.000Z",
      },
      {
        url: "https://www.example.com/blog/second-post",
        lastModified: "2024-03-10T00:00:00.000Z",
      },
    ]);
  });
});
