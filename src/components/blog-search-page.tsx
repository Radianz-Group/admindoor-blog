import type {
  BlogConfig,
  BlogSearchFieldWeights,
  BlogSearchRecord,
} from "admindoor-blog";
import {
  DEFAULT_LOCALE,
  DEFAULT_SEARCH_EMPTY_RESULTS_MESSAGE,
  DEFAULT_SEARCH_FIELD_WEIGHTS,
  DEFAULT_SEARCH_MAX_QUERY_LENGTH,
  DEFAULT_SEARCH_PLACEHOLDER,
  DEFAULT_SEARCH_QUERY_PARAM,
} from "admindoor-blog/constants";
import { getBlogBasePath, getListingPageUrl } from "admindoor-blog/next";
import { BlogSearchExperience } from "./blog-search-experience";
import { cn } from "./primitives/cn";
import type { BlogListingUi } from "./ui-types";

export interface BlogSearchPageProps {
  config: BlogConfig;
  records: BlogSearchRecord[];
  query: string;
  className?: string;
  ui?: BlogListingUi;
}

export function BlogSearchPage({
  config,
  records,
  query,
  className,
  ui,
}: BlogSearchPageProps) {
  const search = config.search;
  const weights: BlogSearchFieldWeights = {
    title: search?.fieldWeights?.title ?? DEFAULT_SEARCH_FIELD_WEIGHTS.title,
    tags: search?.fieldWeights?.tags ?? DEFAULT_SEARCH_FIELD_WEIGHTS.tags,
    primaryTopic:
      search?.fieldWeights?.primaryTopic ?? DEFAULT_SEARCH_FIELD_WEIGHTS.primaryTopic,
    excerpt: search?.fieldWeights?.excerpt ?? DEFAULT_SEARCH_FIELD_WEIGHTS.excerpt,
  };

  return (
    <main
      data-blog-root
      className={cn(
        "blog-root min-h-screen bg-(--blog-page-bg)",
        className,
        ui?.classNames?.root,
      )}
    >
      <BlogSearchExperience
        records={records}
        initialQuery={query}
        weights={weights}
        basePath={getBlogBasePath(config)}
        listingPageOneUrl={getListingPageUrl(config, 1)}
        queryParam={search?.queryParam ?? DEFAULT_SEARCH_QUERY_PARAM}
        maxQueryLength={search?.maxQueryLength ?? DEFAULT_SEARCH_MAX_QUERY_LENGTH}
        placeholder={search?.placeholder ?? DEFAULT_SEARCH_PLACEHOLDER}
        postBasePath={getBlogBasePath(config)}
        locale={config.locale ?? DEFAULT_LOCALE}
        emptyMessage={
          search?.emptyResultsMessage ?? DEFAULT_SEARCH_EMPTY_RESULTS_MESSAGE
        }
        classNames={ui?.classNames}
        ctaLabel={ui?.ctaLabel}
      />
    </main>
  );
}
