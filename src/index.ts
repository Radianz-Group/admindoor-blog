export type {
  BlogConfig,
  BlogShareUrlResolver,
  BlogShareUtmContentResolver,
} from "./core/config-schema";
export {
  DEFAULT_ARTICLE_CARD_CTA_LABEL,
  DEFAULT_BLOG_BASE_PATH,
  DEFAULT_BLOG_LISTING_PATH,
  DEFAULT_LISTING_EMPTY_MESSAGE,
  DEFAULT_LISTING_TITLE,
  DEFAULT_LOCALE,
  DEFAULT_POST_NOT_FOUND_TITLE,
  DEFAULT_POSTS_PER_PAGE,
  DEFAULT_RELATED_POSTS_TITLE,
  DEFAULT_SEARCH_EMPTY_RESULTS_MESSAGE,
  DEFAULT_SEARCH_FIELD_WEIGHTS,
  DEFAULT_SEARCH_LABEL,
  DEFAULT_SEARCH_BUTTON_LABEL,
  DEFAULT_SEARCH_MAX_QUERY_LENGTH,
  DEFAULT_SEARCH_PLACEHOLDER,
  DEFAULT_SEARCH_QUERY_PARAM,
} from "./constants";
export { blogConfigInputSchema } from "./core/config-schema";
export { createBlogConfig, type BlogConfigInput } from "./next/create-blog-config";
export { createBlogDataLayer } from "./core/create-data-layer";
export { formatPostDate } from "./core/dates";
export {
  buildSearchIndex,
  buildSearchRecords,
  searchPosts,
  type BlogSearchFieldWeights,
  type BlogSearchIndex,
  type BlogSearchRecord,
} from "./core/search";
export {
  normalizeSearchQuery,
  resolveSearchQueryFromLocationSearch,
  truncateSearchQuery,
} from "./core/search-query";
export {
  getPageNumbers,
  getPostsForPage,
  getTotalPages,
  isValidPage,
  parsePageNumber,
} from "./core/pagination";
export type {
  BlogContentSource,
  BlogPost,
  BlogPostFaq,
  BlogPostSeo,
} from "./core/types";
