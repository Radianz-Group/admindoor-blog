import { createAdmindoorSource } from "../adapters/admindoor/create-source";
import { DEFAULT_LOCALE } from "../constants";
import type { BlogConfig } from "./config-schema";
import { formatPostDate } from "./dates";
import type { BlogContentSource, BlogPost } from "./types";

function isAdmindoorContent(
  content: BlogConfig["content"],
): content is { type: "admindoor"; apiUrl: string } {
  return "type" in content && content.type === "admindoor";
}

function resolveContentSource(config: BlogConfig): BlogContentSource {
  if (isAdmindoorContent(config.content)) {
    return createAdmindoorSource(config.content.apiUrl);
  }

  return config.content;
}

export function createBlogDataLayer(config: BlogConfig) {
  const source = resolveContentSource(config);
  const locale = config.locale ?? DEFAULT_LOCALE;
  let cachedPosts: BlogPost[] | null = null;
  let inflightPosts: Promise<BlogPost[]> | null = null;

  async function getAllPosts(): Promise<BlogPost[]> {
    if (cachedPosts) {
      return cachedPosts;
    }

    if (!inflightPosts) {
      inflightPosts = source.getPosts().then((posts) => {
        cachedPosts = posts;
        inflightPosts = null;
        return posts;
      });
    }

    return inflightPosts;
  }

  async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const posts = await getAllPosts();
    return posts.find((post) => post.slug === slug);
  }

  function formatPostDateForConfig(date: string): string {
    return formatPostDate(date, locale);
  }

  return {
    getAllPosts,
    getPostBySlug,
    formatPostDate: formatPostDateForConfig,
  };
}

export type BlogDataLayer = ReturnType<typeof createBlogDataLayer>;

const sharedDataLayers = new WeakMap<BlogConfig, BlogDataLayer>();

/** Reuses one data layer (and fetch cache) per config object across route factories. */
export function getSharedBlogDataLayer(config: BlogConfig): BlogDataLayer {
  const existing = sharedDataLayers.get(config);

  if (existing) {
    return existing;
  }

  const layer = createBlogDataLayer(config);
  sharedDataLayers.set(config, layer);
  return layer;
}
