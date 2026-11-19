import type { BlogPost } from "./types";
import { create, insertMultiple, search, type AnyOrama } from "@orama/orama";
import { stemmer as englishStemmer } from "@orama/stemmers/english";
import { stopwords as englishStopWords } from "@orama/stopwords/english";

export interface BlogSearchFieldWeights {
  title: number;
  tags: number;
  primaryTopic: number;
  excerpt: number;
}

export interface BlogSearchRecord {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  primaryTopic?: string;
  publishedAt: string;
  imageUrl?: string;
  imageAlt?: string;
  author?: string;
  authorImage?: string;
}

export interface BlogSearchIndex {
  db: AnyOrama;
  weights: BlogSearchFieldWeights;
  records: BlogSearchRecord[];
}

const TOKEN_PATTERN = /[\p{L}\p{N}]+/gu;
const STOP_WORDS = new Set(englishStopWords);

function tokenizeQuery(query: string): string[] {
  const tokens = query.toLocaleLowerCase().match(TOKEN_PATTERN) ?? [];
  const terms = tokens
    .map((token) => englishStemmer(token))
    .filter((token) => token.length >= 2 && !STOP_WORDS.has(token));
  return [...new Set(terms)];
}

export function buildSearchRecords(posts: BlogPost[]): BlogSearchRecord[] {
  return posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    tags: post.seo?.tags ?? [],
    primaryTopic: post.seo?.primaryTopic,
    publishedAt: post.publishedAt,
    imageUrl: post.imageUrl,
    imageAlt: post.imageAlt,
    author: post.author,
    authorImage: post.authorImage,
  }));
}

export async function buildSearchIndex(
  records: BlogSearchRecord[],
  weights: BlogSearchFieldWeights,
): Promise<BlogSearchIndex> {
  const db = await create({
    schema: {
      slug: "string",
      title: "string",
      excerpt: "string",
      tags: "string",
      primaryTopic: "string",
      publishedAt: "string",
      imageUrl: "string",
      imageAlt: "string",
      author: "string",
      authorImage: "string",
    },
    components: {
      tokenizer: {
        language: "english",
        stemming: true,
        stemmer: englishStemmer,
        stopWords: englishStopWords,
      },
    },
  });

  await insertMultiple(
    db,
    records.map((record) => ({
      ...record,
      tags: record.tags.join(" "),
      primaryTopic: record.primaryTopic ?? "",
      imageUrl: record.imageUrl ?? "",
      imageAlt: record.imageAlt ?? "",
      author: record.author ?? "",
      authorImage: record.authorImage ?? "",
    })),
  );

  return { db, weights, records };
}

export async function searchPosts(
  index: BlogSearchIndex,
  query: string,
): Promise<BlogSearchRecord[]> {
  const terms = tokenizeQuery(query);
  if (!terms.length) return [];

  const commonSearchOptions = {
    mode: "fulltext" as const,
    properties: ["title", "tags", "primaryTopic", "excerpt"],
    boost: {
      title: index.weights.title,
      tags: index.weights.tags,
      primaryTopic: index.weights.primaryTopic,
      excerpt: index.weights.excerpt,
    },
    tolerance: 0,
    limit: Math.max(index.records.length, 1),
  };

  const perTermResults = await Promise.all(
    terms.map((term) =>
      search(index.db, {
        ...commonSearchOptions,
        term,
      }),
    ),
  );

  let matchedSlugs = new Set(
    perTermResults[0]?.hits.map((hit) => hit.document.slug) ?? [],
  );
  for (const perTerm of perTermResults.slice(1)) {
    const current = new Set(perTerm.hits.map((hit) => hit.document.slug));
    matchedSlugs = new Set([...matchedSlugs].filter((slug) => current.has(slug)));
  }

  const result = await search(index.db, {
    term: query,
    ...commonSearchOptions,
  });

  const sorted = result.hits
    .filter((hit) => matchedSlugs.has(hit.document.slug))
    .sort((first, second) => {
      if (first.score !== second.score) return second.score - first.score;
      return (
        Date.parse(second.document.publishedAt) - Date.parse(first.document.publishedAt)
      );
    });

  return sorted.map((hit) => ({
    slug: hit.document.slug,
    title: hit.document.title,
    excerpt: hit.document.excerpt,
    tags: hit.document.tags ? hit.document.tags.split(" ").filter(Boolean) : [],
    primaryTopic: hit.document.primaryTopic || undefined,
    publishedAt: hit.document.publishedAt,
    imageUrl: hit.document.imageUrl || undefined,
    imageAlt: hit.document.imageAlt || undefined,
    author: hit.document.author || undefined,
    authorImage: hit.document.authorImage || undefined,
  }));
}
