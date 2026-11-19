import { DEFAULT_POSTS_PER_PAGE } from "../constants";
import type { BlogConfig } from "../core/config-schema";
import { getTotalPages } from "../core/pagination";
import type { BlogPost } from "../core/types";
import { getListingPageUrl, getPostUrl } from "../next/paths";
import { toAbsoluteSiteUrl } from "./helpers";

export interface BlogSitemapEntry {
  url: string;
  lastModified?: string;
}

export function generateBlogSitemapEntries(
  config: BlogConfig,
  posts: BlogPost[],
): BlogSitemapEntry[] {
  const postsPerPage = config.listing?.postsPerPage ?? DEFAULT_POSTS_PER_PAGE;
  const totalPages = getTotalPages(posts.length, postsPerPage);
  const entries: BlogSitemapEntry[] = [];

  for (let page = 1; page <= totalPages; page++) {
    entries.push({
      url: toAbsoluteSiteUrl(config.site.url, getListingPageUrl(config, page)),
    });
  }

  for (const post of posts) {
    entries.push({
      url: toAbsoluteSiteUrl(config.site.url, getPostUrl(config, post.slug)),
      lastModified: post.updatedAt ?? post.publishedAt,
    });
  }

  return entries;
}
