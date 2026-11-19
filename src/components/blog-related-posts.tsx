import type { ReactNode } from "react";

import type { BlogConfig } from "admindoor-blog";
import { formatPostDate } from "admindoor-blog";
import type { BlogPost } from "admindoor-blog";
import { DEFAULT_LOCALE, DEFAULT_RELATED_POSTS_TITLE } from "admindoor-blog/constants";
import { getPostUrl } from "admindoor-blog/next";
import { BlogArticleGrid } from "./blog-article-grid";
import { cn } from "./primitives/cn";
import type {
  BlogArticleCardClassNames,
  BlogArticleCardData,
  BlogArticleGridClassNames,
} from "./ui-types";

export interface BlogRelatedPostsProps {
  config: BlogConfig;
  posts: BlogPost[];
  className?: string;
  classNames?: BlogArticleGridClassNames;
  cardClassNames?: BlogArticleCardClassNames;
  renderCard?: (article: BlogArticleCardData) => ReactNode;
  cardFooter?: ReactNode;
  ctaLabel?: string;
}

export function BlogRelatedPosts({
  config,
  posts,
  className,
  classNames,
  cardClassNames,
  renderCard,
  cardFooter,
  ctaLabel,
}: BlogRelatedPostsProps) {
  if (!posts.length) {
    return null;
  }

  const locale = config.locale ?? DEFAULT_LOCALE;
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

  return (
    <BlogArticleGrid
      id="related-posts"
      title={DEFAULT_RELATED_POSTS_TITLE}
      articles={articles}
      className={cn("bg-(--blog-page-bg)", className)}
      classNames={classNames}
      cardClassNames={cardClassNames ?? classNames?.card}
      renderCard={renderCard}
      cardFooter={cardFooter}
      ctaLabel={ctaLabel}
    />
  );
}
