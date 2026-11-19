import type { BlogConfig } from "../core/config-schema";
import type { BlogPost } from "../core/types";
import type { ShareUtm } from "../components/share-links";
import {
  DEFAULT_BLOG_BASE_PATH,
  DEFAULT_BLOG_LISTING_PATH,
  DEFAULT_SEARCH_QUERY_PARAM,
} from "../constants";

function normalizePath(path: string, fallback: string): string {
  const trimmed = path.trim();
  if (!trimmed) return fallback;

  const withLeading = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeading.replace(/\/+$/, "") || fallback;
}

export function getBlogBasePath(config: BlogConfig): string {
  return normalizePath(
    config.routes?.basePath ?? DEFAULT_BLOG_BASE_PATH,
    DEFAULT_BLOG_BASE_PATH,
  );
}

export function getListingBasePath(config: BlogConfig): string {
  return normalizePath(
    config.routes?.listingPath ?? DEFAULT_BLOG_LISTING_PATH,
    DEFAULT_BLOG_LISTING_PATH,
  );
}

export function getPostUrl(config: BlogConfig, slug: string): string {
  return `${getBlogBasePath(config)}/${slug}`;
}

export function getListingPageUrl(config: BlogConfig, page: number): string {
  return `${getListingBasePath(config)}/${page}`;
}

export function getBlogSearchUrl(config: BlogConfig, query: string): string {
  const searchParams = new URLSearchParams({
    [config.search?.queryParam ?? DEFAULT_SEARCH_QUERY_PARAM]: query,
  });
  return `${getBlogBasePath(config)}?${searchParams.toString()}`;
}

/**
 * Absolute URL used by the share button. Defaults to `site.url` + post path;
 * `postPage.share.getUrl` can override it (empty/invalid results fall back).
 */
export function getPostShareUrl(config: BlogConfig, post: BlogPost): string {
  const defaultUrl = `${config.site.url.replace(/\/+$/, "")}${getPostUrl(config, post.slug)}`;
  const resolved = config.postPage?.share?.getUrl?.(post, defaultUrl)?.trim();
  return resolved || defaultUrl;
}

/**
 * UTM settings for share links, or undefined when tagging is off.
 * Off unless `postPage.share.utm.enabled` is true.
 */
export function getPostShareUtm(
  config: BlogConfig,
  post: BlogPost,
): ShareUtm | undefined {
  const utm = config.postPage?.share?.utm;
  if (!utm?.enabled) return undefined;
  const content = typeof utm.content === "function" ? utm.content(post) : utm.content;
  return {
    medium: utm.medium,
    campaign: utm.campaign,
    term: utm.term,
    content: content || post.slug,
    sources: utm.sources,
    mediums: utm.mediums,
  };
}
