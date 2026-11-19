import type { Metadata } from "next";

import type { BlogConfig } from "../core/config-schema";
import { getSiteMetadataBase } from "./helpers";

export function buildSearchMetadata(config: BlogConfig, query?: string): Metadata {
  return {
    metadataBase: getSiteMetadataBase(config),
    title: query
      ? `Search: ${query} - ${config.site.name}`
      : `Search - ${config.site.name}`,
    robots: {
      index: false,
      follow: true,
    },
  };
}
