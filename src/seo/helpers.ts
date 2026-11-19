import type { BlogConfig } from "../core/config-schema";
import type { BlogPost } from "../core/types";

export function isHttpsUrl(value: string | undefined): value is string {
  return typeof value === "string" && value.startsWith("https://");
}

export function getSiteMetadataBase(config: BlogConfig): URL {
  return new URL(config.site.url);
}

export function getBlogPostSeoTitle(post: BlogPost): string {
  return post.seo?.title?.trim() || post.title.trim();
}

export function getBlogPostSeoDescription(post: BlogPost): string {
  return post.seo?.description?.trim() || post.excerpt.trim();
}

export function getBlogPostKeywordTags(post: BlogPost): string[] {
  return post.seo?.tags?.filter((tag) => !tag.startsWith("related:")) ?? [];
}

export function getBlogPostFeaturedImage(post: BlogPost): string | undefined {
  if (isHttpsUrl(post.seo?.featuredImage)) {
    return post.seo.featuredImage;
  }

  if (isHttpsUrl(post.imageUrl)) {
    return post.imageUrl;
  }

  return undefined;
}

export function toAbsoluteSiteUrl(siteUrl: string, path: string): string {
  const base = siteUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

/** Normalizes a Twitter/X handle to the `@name` form expected by metadata. */
export function normalizeTwitterHandle(handle: string | undefined): string | undefined {
  const trimmed = handle?.trim();
  if (!trimmed) {
    return undefined;
  }

  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

/** Escapes `<` so JSON-LD is safe inside `<script>` tags. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
