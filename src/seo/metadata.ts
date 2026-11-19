import type { Metadata } from "next";

import type { BlogConfig } from "../core/config-schema";
import type { BlogPost } from "../core/types";
import { getPostUrl } from "../next/paths";
import {
  getBlogPostKeywordTags,
  getBlogPostSeoDescription,
  getBlogPostSeoTitle,
  getSiteMetadataBase,
  normalizeTwitterHandle,
  toAbsoluteSiteUrl,
} from "./helpers";

export function buildBlogPostMetadata(config: BlogConfig, post: BlogPost): Metadata {
  const seoTitle = getBlogPostSeoTitle(post);
  const description = getBlogPostSeoDescription(post);
  const imageAlt = post.imageAlt ?? post.title;
  const keywordTags = getBlogPostKeywordTags(post);
  const postPath = getPostUrl(config, post.slug);
  const postUrl = toAbsoluteSiteUrl(config.site.url, postPath);
  // Same-origin optimized cover route (see createBlogPostOpengraphImage).
  // Always emit so OG validators get a 1200×630 image even without a featured cover.
  const ogImagePath = `${postPath}/opengraph-image`;
  const twitterSite = normalizeTwitterHandle(config.site.twitterHandle);

  return {
    metadataBase: getSiteMetadataBase(config),
    title: `${seoTitle} - ${config.site.name}`,
    description,
    ...(keywordTags.length ? { keywords: keywordTags } : {}),
    ...(post.seo?.robotsIndex === false
      ? { robots: { index: false, follow: true } }
      : {}),
    alternates: {
      canonical: postPath,
    },
    openGraph: {
      title: seoTitle,
      description,
      type: "article",
      url: postUrl,
      siteName: config.site.name,
      ...(config.locale ? { locale: config.locale } : {}),
      publishedTime: post.publishedAt,
      ...(post.updatedAt ? { modifiedTime: post.updatedAt } : {}),
      ...(post.author ? { authors: [post.author] } : {}),
      ...(post.seo?.primaryTopic ? { section: post.seo.primaryTopic } : {}),
      ...(keywordTags.length ? { tags: keywordTags } : {}),
      images: [
        {
          url: ogImagePath,
          alt: imageAlt,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description,
      images: [ogImagePath],
      ...(twitterSite ? { site: twitterSite } : {}),
    },
  };
}
