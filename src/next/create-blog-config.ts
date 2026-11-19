import type { z } from "zod";

import {
  DEFAULT_LOCALE,
  DEFAULT_POSTS_PER_PAGE,
  DEFAULT_SEARCH_EMPTY_RESULTS_MESSAGE,
  DEFAULT_SEARCH_FIELD_WEIGHTS,
  DEFAULT_SEARCH_MAX_QUERY_LENGTH,
  DEFAULT_SEARCH_PLACEHOLDER,
  DEFAULT_SEARCH_QUERY_PARAM,
} from "../constants";
import { blogConfigInputSchema, type BlogConfig } from "../core/config-schema";

export type BlogConfigInput = z.input<typeof blogConfigInputSchema>;

export function createBlogConfig(input: BlogConfigInput): BlogConfig {
  const parsed = blogConfigInputSchema.parse(input);

  return {
    ...parsed,
    locale: parsed.locale ?? DEFAULT_LOCALE,
    listing: {
      postsPerPage: DEFAULT_POSTS_PER_PAGE,
      ...parsed.listing,
    },
    search: {
      enabled: false,
      maxQueryLength: DEFAULT_SEARCH_MAX_QUERY_LENGTH,
      queryParam: DEFAULT_SEARCH_QUERY_PARAM,
      placeholder: DEFAULT_SEARCH_PLACEHOLDER,
      emptyResultsMessage: DEFAULT_SEARCH_EMPTY_RESULTS_MESSAGE,
      ...parsed.search,
      fieldWeights: {
        ...DEFAULT_SEARCH_FIELD_WEIGHTS,
        ...parsed.search?.fieldWeights,
      },
    },
  };
}
