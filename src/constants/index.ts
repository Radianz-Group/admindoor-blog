export const DEFAULT_LOCALE = "en-IN";

export const DEFAULT_BLOG_BASE_PATH = "/blog";
export const DEFAULT_BLOG_LISTING_PATH = "/blog/p";

export const DEFAULT_POSTS_PER_PAGE = 12;
export const DEFAULT_LISTING_TITLE = "Blog";
export const DEFAULT_LISTING_EMPTY_MESSAGE = "No articles available yet.";

export const DEFAULT_POST_NOT_FOUND_TITLE = "Article not found";
export const DEFAULT_RELATED_POSTS_TITLE = "Related posts";

export const DEFAULT_ARTICLE_CARD_CTA_LABEL = "Read more";

export const DEFAULT_SEARCH_QUERY_PARAM = "q";
export const DEFAULT_SEARCH_MAX_QUERY_LENGTH = 100;
export const DEFAULT_SEARCH_PLACEHOLDER = "Search articles…";
export const DEFAULT_SEARCH_EMPTY_RESULTS_MESSAGE = "No articles match your search.";
export const DEFAULT_SEARCH_LABEL = "Search articles";
export const DEFAULT_SEARCH_BUTTON_LABEL = "Search";

export const DEFAULT_SEARCH_FIELD_WEIGHTS = {
  title: 1,
  tags: 1,
  primaryTopic: 1,
  excerpt: 1,
} as const;
