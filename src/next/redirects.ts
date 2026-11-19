import type { BlogConfig } from "../core/config-schema";
import { DEFAULT_SEARCH_QUERY_PARAM } from "../constants";
import { getBlogBasePath, getListingPageUrl } from "./paths";

export interface BlogRedirectEntry {
  source: string;
  destination: string;
  permanent: boolean;
  missing?: Array<{
    type: "query";
    key: string;
    value?: string;
  }>;
}

export function getBlogRedirects(config: BlogConfig): BlogRedirectEntry[] {
  const missing = config.search?.enabled
    ? [
        {
          type: "query" as const,
          key: config.search.queryParam ?? DEFAULT_SEARCH_QUERY_PARAM,
        },
      ]
    : undefined;

  return [
    {
      source: getBlogBasePath(config),
      destination: getListingPageUrl(config, 1),
      permanent: true,
      ...(missing ? { missing } : {}),
    },
  ];
}
