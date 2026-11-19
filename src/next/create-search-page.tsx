import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BlogSearchPage } from "../components/blog-search-page";
import type { BlogListingUi } from "../components/ui-types";
import type { BlogConfig } from "../core/config-schema";
import { getSharedBlogDataLayer } from "../core/create-data-layer";
import { buildSearchRecords } from "../core/search";
import { buildSearchMetadata } from "../seo/search-metadata";
import { getListingPageUrl } from "./paths";

export interface CreateBlogSearchPageOptions {
  ui?: BlogListingUi;
}

export function createBlogSearchPage(
  config: BlogConfig,
  options: CreateBlogSearchPageOptions = {},
) {
  const dataLayer = getSharedBlogDataLayer(config);

  return {
    generateMetadata: async (): Promise<Metadata> => buildSearchMetadata(config),

    default: async function BlogSearchRoute() {
      if (!config.search?.enabled) {
        redirect(getListingPageUrl(config, 1));
      }

      const posts = await dataLayer.getAllPosts();

      return (
        <BlogSearchPage
          config={config}
          query=""
          records={buildSearchRecords(posts)}
          ui={options.ui}
        />
      );
    },
  };
}
