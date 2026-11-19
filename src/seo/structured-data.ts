import type { BlogConfig } from "../core/config-schema";
import type { BlogPost } from "../core/types";
import { getListingPageUrl, getPostUrl } from "../next/paths";
import {
  getBlogPostFeaturedImage,
  getBlogPostKeywordTags,
  getBlogPostSeoDescription,
  getBlogPostSeoTitle,
  toAbsoluteSiteUrl,
} from "./helpers";

export interface BlogPostStructuredDataOptions {
  homeHref?: string;
  homeLabel?: string;
}

function getBlogListingLabel(config: BlogConfig): string {
  return config.listing?.title?.trim() || "Blog";
}

export function getOrganizationSchemaId(siteUrl: string): string {
  return `${siteUrl.replace(/\/+$/, "")}#organization`;
}

export function getWebsiteSchemaId(siteUrl: string): string {
  return `${siteUrl.replace(/\/+$/, "")}#website`;
}

function buildPublisherLogo(config: BlogConfig): Record<string, unknown> {
  const logoUrl =
    config.site.logoUrl ?? toAbsoluteSiteUrl(config.site.url, "/logo.png");

  return {
    "@type": "ImageObject",
    url: logoUrl,
    ...(config.site.logoWidth ? { width: config.site.logoWidth } : {}),
    ...(config.site.logoHeight ? { height: config.site.logoHeight } : {}),
  };
}

/** Standalone Organization schema for host root layouts. */
export function buildOrganizationStructuredData(
  config: BlogConfig,
): Record<string, unknown> {
  const sameAs = config.site.sameAs?.filter((url) => url.trim().length > 0);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": getOrganizationSchemaId(config.site.url),
    name: config.site.name,
    url: config.site.url,
    ...(config.site.legalName ? { legalName: config.site.legalName } : {}),
    ...(config.site.description ? { description: config.site.description } : {}),
    logo: buildPublisherLogo(config),
    ...(sameAs?.length ? { sameAs } : {}),
  };
}

/** Standalone WebSite schema that links to Organization via @id. */
export function buildWebsiteStructuredData(
  config: BlogConfig,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": getWebsiteSchemaId(config.site.url),
    name: config.site.name,
    url: config.site.url,
    ...(config.site.description ? { description: config.site.description } : {}),
    publisher: {
      "@id": getOrganizationSchemaId(config.site.url),
    },
  };
}

function buildInlinePublisher(config: BlogConfig): Record<string, unknown> {
  return {
    "@type": "Organization",
    "@id": getOrganizationSchemaId(config.site.url),
    name: config.site.name,
    url: config.site.url,
    logo: buildPublisherLogo(config),
  };
}

function buildBlogPostBreadcrumbSchema(
  config: BlogConfig,
  post: BlogPost,
  options: BlogPostStructuredDataOptions = {},
): Record<string, unknown> {
  const homeHref = options.homeHref ?? "/";
  const homeLabel = options.homeLabel ?? "Home";
  const blogLabel = getBlogListingLabel(config);
  const homeUrl = toAbsoluteSiteUrl(config.site.url, homeHref);
  const blogUrl = toAbsoluteSiteUrl(config.site.url, getListingPageUrl(config, 1));
  const postUrl = toAbsoluteSiteUrl(config.site.url, getPostUrl(config, post.slug));
  const postTitle = getBlogPostSeoTitle(post);

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: homeLabel,
        item: homeUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: blogLabel,
        item: blogUrl,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: postTitle,
        item: postUrl,
      },
    ],
  };
}

export function buildBlogPostStructuredData(
  config: BlogConfig,
  post: BlogPost,
  options: BlogPostStructuredDataOptions = {},
): Record<string, unknown>[] {
  const seoTitle = getBlogPostSeoTitle(post);
  const description = getBlogPostSeoDescription(post);
  const featuredImage = getBlogPostFeaturedImage(post);
  const postPath = getPostUrl(config, post.slug);
  const postUrl = toAbsoluteSiteUrl(config.site.url, postPath);
  const blogListingUrl = toAbsoluteSiteUrl(
    config.site.url,
    getListingPageUrl(config, 1),
  );
  const schemaType = post.seo?.schemaType?.trim() || "Article";
  const keywordTags = getBlogPostKeywordTags(post);
  const inLanguage = config.locale ?? "en";
  // Google Article rich results require image; fall back to the OG route when no cover.
  const articleImage =
    featuredImage ?? toAbsoluteSiteUrl(config.site.url, `${postPath}/opengraph-image`);

  const articleSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": schemaType,
    "@id": `${postUrl}#article`,
    ...(seoTitle ? { headline: seoTitle } : {}),
    ...(description ? { description } : {}),
    url: postUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    isPartOf: {
      "@type": "Blog",
      "@id": `${blogListingUrl}#blog`,
      name: getBlogListingLabel(config),
      url: blogListingUrl,
    },
    inLanguage,
    datePublished: post.publishedAt,
    ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
    publisher: buildInlinePublisher(config),
    image: [articleImage],
    ...(post.author
      ? {
          author: {
            "@type": "Person",
            name: post.author,
            ...(post.authorImage ? { image: post.authorImage } : {}),
          },
        }
      : {}),
    ...(post.seo?.keyTakeaways?.length
      ? {
          hasPart: post.seo.keyTakeaways.map((takeaway) => ({
            "@type": "CreativeWork",
            name: "Key takeaway",
            text: takeaway,
          })),
        }
      : {}),
    ...(post.seo?.primaryTopic ? { articleSection: post.seo.primaryTopic } : {}),
    ...(post.seo?.summary ? { abstract: post.seo.summary } : {}),
    ...(post.seo?.targetQuery
      ? {
          about: {
            "@type": "Question",
            name: post.seo.targetQuery,
          },
        }
      : {}),
    ...(keywordTags.length ? { keywords: keywordTags.join(", ") } : {}),
  };

  const schemas: Record<string, unknown>[] = [
    articleSchema,
    buildBlogPostBreadcrumbSchema(config, post, options),
  ];

  const faqs = post.seo?.faqs?.filter(
    (faq) => faq.question.trim().length > 0 && faq.answer.trim().length > 0,
  );

  if (faqs?.length) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${postUrl}#faq`,
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    });
  }

  return schemas;
}

export function buildListingStructuredData(
  config: BlogConfig,
  posts: BlogPost[],
  page: number,
): Record<string, unknown>[] {
  const listingTitle = getBlogListingLabel(config);
  const listingDescription = config.listing?.subtitle?.trim();
  const listingPath = getListingPageUrl(config, page);
  const listingUrl = toAbsoluteSiteUrl(config.site.url, listingPath);
  const pageTitle = page === 1 ? listingTitle : `${listingTitle} — Page ${page}`;

  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${listingUrl}#webpage`,
      name: pageTitle,
      ...(listingDescription ? { description: listingDescription } : {}),
      url: listingUrl,
      isPartOf: {
        "@type": "WebSite",
        "@id": getWebsiteSchemaId(config.site.url),
        name: config.site.name,
        url: config.site.url,
        publisher: {
          "@id": getOrganizationSchemaId(config.site.url),
        },
      },
      mainEntity: {
        "@type": "ItemList",
        itemListElement: posts.map((post, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: toAbsoluteSiteUrl(config.site.url, getPostUrl(config, post.slug)),
          name: getBlogPostSeoTitle(post),
        })),
      },
    },
  ];
}
