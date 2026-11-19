"use client";

import { useEffect, useState } from "react";

import {
  buildSearchIndex,
  formatPostDate,
  searchPosts,
  type BlogSearchFieldWeights,
  type BlogSearchRecord,
} from "admindoor-blog";
import { BlogArticleGrid } from "./blog-article-grid";
import { BlogSection } from "./primitives/blog-section";
import { BlogSectionHeader } from "./primitives/blog-section-header";
import { cn } from "./primitives/cn";
import type { BlogListingPageClassNames } from "./ui-types";

export interface BlogSearchResultsProps {
  records: BlogSearchRecord[];
  query: string;
  weights: BlogSearchFieldWeights;
  postBasePath: string;
  locale: string;
  emptyMessage: string;
  classNames?: BlogListingPageClassNames;
  ctaLabel?: string;
}

export function BlogSearchResults({
  records,
  query,
  weights,
  postBasePath,
  locale,
  emptyMessage,
  classNames,
  ctaLabel,
}: BlogSearchResultsProps) {
  const [index, setIndex] = useState<Awaited<
    ReturnType<typeof buildSearchIndex>
  > | null>(null);
  const [results, setResults] = useState<BlogSearchRecord[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsReady(false);

    (async () => {
      const nextIndex = await buildSearchIndex(records, weights);
      if (!cancelled) {
        setIndex(nextIndex);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [records, weights]);

  useEffect(() => {
    if (!index) return;
    let cancelled = false;

    (async () => {
      const nextResults = await searchPosts(index, query);
      if (!cancelled) {
        setResults(nextResults);
        setIsReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [index, query]);

  const title = `Search results for “${query}”`;
  const articles = results.map((post) => ({
    href: `${postBasePath}/${post.slug}`,
    title: post.title,
    description: post.excerpt,
    date: formatPostDate(post.publishedAt, locale),
    category: post.primaryTopic,
    author: post.author,
    authorImage: post.authorImage,
    imageUrl: post.imageUrl,
    imageAlt: post.imageAlt,
  }));

  if (isReady && !articles.length) {
    return (
      <BlogSection id="blog-search-results">
        <div className="space-y-4">
          <BlogSectionHeader
            title={title}
            headingLevel="h1"
            align="left"
            classNames={classNames?.header}
          />
          <p
            className={cn("text-sm text-(--blog-subtle-fg)", classNames?.search?.empty)}
          >
            {emptyMessage}
          </p>
        </div>
      </BlogSection>
    );
  }

  return (
    <BlogArticleGrid
      id="blog-search-results"
      title={title}
      subtitle={`${articles.length} ${articles.length === 1 ? "article" : "articles"} found`}
      headingLevel="h1"
      articles={articles}
      classNames={{
        ...classNames?.grid,
        header: classNames?.header ?? classNames?.grid?.header,
        card: classNames?.card ?? classNames?.grid?.card,
      }}
      cardClassNames={classNames?.card ?? classNames?.grid?.card}
      ctaLabel={ctaLabel}
    />
  );
}
