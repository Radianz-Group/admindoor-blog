import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogListingPage } from "../components/blog-listing-page";
import { DEFAULT_POSTS_PER_PAGE } from "../constants";
import type { BlogListingUi } from "../components/ui-types";
import type { BlogConfig } from "../core/config-schema";
import { getSharedBlogDataLayer } from "../core/create-data-layer";
import {
  getPostsForPage,
  getTotalPages,
  isValidPage,
  parsePageNumber,
} from "../core/pagination";
import { buildListingMetadata } from "../seo/listing-metadata";

interface BlogListingPageParams {
  params: Promise<{
    page: string;
  }>;
}

export interface CreateBlogListingPageOptions {
  ui?: BlogListingUi;
}

export function createBlogListingPage(
  config: BlogConfig,
  options: CreateBlogListingPageOptions = {},
) {
  const dataLayer = getSharedBlogDataLayer(config);
  const postsPerPage = config.listing?.postsPerPage ?? DEFAULT_POSTS_PER_PAGE;

  return {
    generateStaticParams: async () => {
      const posts = await dataLayer.getAllPosts();
      const totalPages = getTotalPages(posts.length, postsPerPage);

      return Array.from({ length: totalPages }, (_, index) => ({
        page: String(index + 1),
      }));
    },

    generateMetadata: async ({ params }: BlogListingPageParams): Promise<Metadata> => {
      const { page: pageParam } = await params;
      const page = parsePageNumber(pageParam);

      if (!page) {
        return { title: `Blog not found - ${config.site.name}` };
      }

      const posts = await dataLayer.getAllPosts();
      const totalPages = getTotalPages(posts.length, postsPerPage);

      if (!isValidPage(page, totalPages)) {
        return { title: `Blog not found - ${config.site.name}` };
      }

      return buildListingMetadata(config, page, totalPages);
    },

    default: async function BlogListingRoute({ params }: BlogListingPageParams) {
      const { page: pageParam } = await params;
      const page = parsePageNumber(pageParam);

      if (!page) {
        notFound();
      }

      const posts = await dataLayer.getAllPosts();
      const totalPages = getTotalPages(posts.length, postsPerPage);

      if (!isValidPage(page, totalPages)) {
        notFound();
      }

      const pagePosts = getPostsForPage(posts, page, postsPerPage);

      return (
        <BlogListingPage
          config={config}
          posts={pagePosts}
          currentPage={page}
          totalPages={totalPages}
          ui={options.ui}
        />
      );
    },
  };
}
