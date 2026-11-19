import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogPostPage } from "../components/blog-post-page";
import { DEFAULT_POST_NOT_FOUND_TITLE } from "../constants";
import type { BlogPostUi } from "../components/ui-types";
import type { BlogConfig } from "../core/config-schema";
import { getSharedBlogDataLayer } from "../core/create-data-layer";
import { resolveRelatedPosts } from "../core/related-posts";
import { buildBlogPostMetadata } from "../seo/metadata";

interface BlogPostPageParams {
  params: Promise<{
    slug: string;
  }>;
}

export interface CreateBlogPostPageOptions {
  homeHref?: string;
  ui?: BlogPostUi;
}

export function createBlogPostPage(
  config: BlogConfig,
  options: CreateBlogPostPageOptions = {},
) {
  const dataLayer = getSharedBlogDataLayer(config);
  const notFoundTitle = config.postPage?.notFoundTitle ?? DEFAULT_POST_NOT_FOUND_TITLE;

  return {
    generateStaticParams: async () => {
      const posts = await dataLayer.getAllPosts();
      return posts.map((post) => ({ slug: post.slug }));
    },

    generateMetadata: async ({ params }: BlogPostPageParams): Promise<Metadata> => {
      const { slug } = await params;
      const post = await dataLayer.getPostBySlug(slug);

      if (!post) {
        return { title: `${notFoundTitle} - ${config.site.name}` };
      }

      return buildBlogPostMetadata(config, post);
    },

    default: async function BlogPostRoute({ params }: BlogPostPageParams) {
      const { slug } = await params;
      const [post, allPosts] = await Promise.all([
        dataLayer.getPostBySlug(slug),
        dataLayer.getAllPosts(),
      ]);

      if (!post) {
        notFound();
      }

      const relatedPosts = resolveRelatedPosts(post, allPosts);

      return (
        <BlogPostPage
          config={config}
          post={post}
          relatedPosts={relatedPosts}
          homeHref={options.homeHref}
          ui={options.ui}
        />
      );
    },
  };
}
