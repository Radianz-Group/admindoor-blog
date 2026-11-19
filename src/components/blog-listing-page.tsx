import type { BlogConfig } from "admindoor-blog";
import { formatPostDate } from "admindoor-blog";
import type { BlogPost } from "admindoor-blog";
import {
  DEFAULT_LISTING_EMPTY_MESSAGE,
  DEFAULT_LISTING_TITLE,
  DEFAULT_LOCALE,
  DEFAULT_SEARCH_MAX_QUERY_LENGTH,
  DEFAULT_SEARCH_PLACEHOLDER,
  DEFAULT_SEARCH_QUERY_PARAM,
} from "admindoor-blog/constants";
import {
  getBlogBasePath,
  getListingBasePath,
  getListingPageUrl,
  getPostUrl,
} from "admindoor-blog/next";
import { buildListingStructuredData, serializeJsonLd } from "admindoor-blog/seo";
import { BlogArticleGrid } from "./blog-article-grid";
import { BlogPagination } from "./blog-pagination";
import { BlogSearchInput } from "./blog-search-input";
import { BlogSection } from "./primitives/blog-section";
import { BlogSectionHeader } from "./primitives/blog-section-header";
import { cn } from "./primitives/cn";
import type { BlogListingUi } from "./ui-types";

export interface BlogListingPageProps {
  config: BlogConfig;
  posts: BlogPost[];
  currentPage: number;
  totalPages: number;
  className?: string;
  ui?: BlogListingUi;
}

export function BlogListingPage({
  config,
  posts,
  currentPage,
  totalPages,
  className,
  ui,
}: BlogListingPageProps) {
  const listingTitle = config.listing?.title ?? DEFAULT_LISTING_TITLE;
  const listingSubtitle = config.listing?.subtitle;
  const listingEyebrow = config.listing?.eyebrow;
  const emptyMessage = config.listing?.emptyMessage ?? DEFAULT_LISTING_EMPTY_MESSAGE;
  const locale = config.locale ?? DEFAULT_LOCALE;
  const listingBasePath = getListingBasePath(config);
  const structuredData = buildListingStructuredData(config, posts, currentPage);
  const classNames = ui?.classNames;

  const articles = posts.map((post) => ({
    href: getPostUrl(config, post.slug),
    title: post.title,
    description: post.excerpt,
    date: formatPostDate(post.publishedAt, locale),
    category: post.seo?.primaryTopic,
    author: post.author,
    authorImage: post.authorImage,
    imageUrl: post.imageUrl,
    imageAlt: post.imageAlt,
  }));

  const headerClassNames = classNames?.header ?? classNames?.grid?.header;
  const cardClassNames = classNames?.card ?? classNames?.grid?.card;

  return (
    <main
      data-blog-root
      className={cn(
        "blog-root min-h-screen bg-(--blog-page-bg)",
        className,
        classNames?.root,
      )}
    >
      {structuredData.map((schema, index) => (
        <script
          key={`${String(schema["@type"])}-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
        />
      ))}

      {config.search?.enabled ? (
        <BlogSection>
          <BlogSearchInput
            basePath={getBlogBasePath(config)}
            listingPageOneUrl={getListingPageUrl(config, 1)}
            queryParam={config.search.queryParam ?? DEFAULT_SEARCH_QUERY_PARAM}
            maxQueryLength={
              config.search.maxQueryLength ?? DEFAULT_SEARCH_MAX_QUERY_LENGTH
            }
            placeholder={config.search.placeholder ?? DEFAULT_SEARCH_PLACEHOLDER}
            classNames={classNames?.search}
          />
        </BlogSection>
      ) : null}

      {posts.length > 0 ? (
        <BlogArticleGrid
          id="blog-listing"
          eyebrow={listingEyebrow}
          title={listingTitle}
          subtitle={listingSubtitle}
          headingLevel="h1"
          articles={articles}
          classNames={{
            ...classNames?.grid,
            header: headerClassNames,
            card: cardClassNames,
          }}
          cardClassNames={cardClassNames}
          renderCard={ui?.renderCard}
          cardFooter={ui?.cardFooter}
          ctaLabel={ui?.ctaLabel}
        />
      ) : (
        <BlogSection id="blog-listing">
          <div className="space-y-4">
            <BlogSectionHeader
              eyebrow={listingEyebrow}
              title={listingTitle}
              subtitle={listingSubtitle}
              headingLevel="h1"
              align="left"
              classNames={headerClassNames}
            />
            <p className={cn("text-sm text-(--blog-subtle-fg)", classNames?.empty)}>
              {emptyMessage}
            </p>
          </div>
        </BlogSection>
      )}

      <BlogSection>
        <BlogPagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath={listingBasePath}
          classNames={classNames?.pagination}
        />
      </BlogSection>
    </main>
  );
}
