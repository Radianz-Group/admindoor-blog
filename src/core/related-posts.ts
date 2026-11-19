import type { BlogPost } from "./types";

const RELATED_TAG_PREFIX = "related:";

export function parseRelatedSlugsFromTags(tags?: string[]): string[] {
  if (!tags?.length) {
    return [];
  }

  const slugs: string[] = [];
  const seen = new Set<string>();

  for (const tag of tags) {
    if (!tag.startsWith(RELATED_TAG_PREFIX)) {
      continue;
    }

    const slug = tag.slice(RELATED_TAG_PREFIX.length).trim();
    if (!slug || seen.has(slug)) {
      continue;
    }

    seen.add(slug);
    slugs.push(slug);
  }

  return slugs;
}

export function resolveRelatedPosts(post: BlogPost, allPosts: BlogPost[]): BlogPost[] {
  const slugs = parseRelatedSlugsFromTags(post.seo?.tags);
  if (!slugs.length) {
    return [];
  }

  const postsBySlug = new Map(allPosts.map((entry) => [entry.slug, entry]));

  return slugs
    .map((slug) => postsBySlug.get(slug))
    .filter((entry): entry is BlogPost => entry != null && entry.slug !== post.slug);
}
