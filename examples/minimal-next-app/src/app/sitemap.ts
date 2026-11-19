import type { MetadataRoute } from "next";
import { createBlogDataLayer } from "admindoor-blog";
import { generateBlogSitemapEntries } from "admindoor-blog/seo";

import { blogConfig } from "@/lib/blog-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { getAllPosts } = createBlogDataLayer(blogConfig);
  const posts = await getAllPosts();

  return [
    { url: blogConfig.site.url },
    ...generateBlogSitemapEntries(blogConfig, posts).map((entry) => ({
      url: entry.url,
      ...(entry.lastModified ? { lastModified: entry.lastModified } : {}),
    })),
  ];
}
