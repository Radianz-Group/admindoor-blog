"use client";

import { useRouter } from "next/navigation";
import { useCallback, useLayoutEffect, useState } from "react";

import {
  resolveSearchQueryFromLocationSearch,
  type BlogSearchFieldWeights,
  type BlogSearchRecord,
} from "admindoor-blog";

import { BlogSearchInput } from "./blog-search-input";
import { BlogSearchResults } from "./blog-search-results";
import { BlogSection } from "./primitives/blog-section";
import type { BlogListingPageClassNames } from "./ui-types";

export interface BlogSearchExperienceProps {
  records: BlogSearchRecord[];
  initialQuery: string;
  weights: BlogSearchFieldWeights;
  basePath: string;
  listingPageOneUrl: string;
  queryParam: string;
  maxQueryLength: number;
  placeholder: string;
  postBasePath: string;
  locale: string;
  emptyMessage: string;
  classNames?: BlogListingPageClassNames;
  ctaLabel?: string;
}

export function BlogSearchExperience({
  records,
  initialQuery,
  weights,
  basePath,
  listingPageOneUrl,
  queryParam,
  maxQueryLength,
  placeholder,
  postBasePath,
  locale,
  emptyMessage,
  classNames,
  ctaLabel,
}: BlogSearchExperienceProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  // Static shell ships query=""; wait for the URL sync before showing results
  // so first paint does not flash an empty "Search results for \"\"" state.
  const [hasSyncedFromUrl, setHasSyncedFromUrl] = useState(Boolean(initialQuery));

  const syncQueryFromUrl = useCallback(() => {
    const nextQuery = resolveSearchQueryFromLocationSearch(
      window.location.search,
      queryParam,
      maxQueryLength,
    );

    if (!nextQuery) {
      router.replace(listingPageOneUrl);
      return;
    }

    setQuery(nextQuery);
    setHasSyncedFromUrl(true);
  }, [listingPageOneUrl, maxQueryLength, queryParam, router]);

  useLayoutEffect(() => {
    syncQueryFromUrl();
    window.addEventListener("popstate", syncQueryFromUrl);
    return () => window.removeEventListener("popstate", syncQueryFromUrl);
  }, [syncQueryFromUrl]);

  function handleSearch(nextQuery: string) {
    const searchParams = new URLSearchParams({ [queryParam]: nextQuery });
    window.history.pushState(null, "", `${basePath}?${searchParams.toString()}`);
    setQuery(nextQuery);
    setHasSyncedFromUrl(true);
  }

  return (
    <>
      <BlogSection>
        <BlogSearchInput
          basePath={basePath}
          listingPageOneUrl={listingPageOneUrl}
          queryParam={queryParam}
          maxQueryLength={maxQueryLength}
          placeholder={placeholder}
          initialQuery={query}
          classNames={classNames?.search}
          onSearch={handleSearch}
        />
      </BlogSection>
      {hasSyncedFromUrl ? (
        <BlogSearchResults
          records={records}
          query={query}
          weights={weights}
          postBasePath={postBasePath}
          locale={locale}
          emptyMessage={emptyMessage}
          classNames={classNames}
          ctaLabel={ctaLabel}
        />
      ) : null}
    </>
  );
}
