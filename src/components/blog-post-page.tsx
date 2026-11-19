import Image from "next/image";
import type { ReactNode } from "react";

import type { BlogConfig } from "admindoor-blog";
import { formatPostDate } from "admindoor-blog";
import type { BlogPost } from "admindoor-blog";
import { DEFAULT_LISTING_TITLE, DEFAULT_LOCALE } from "admindoor-blog/constants";
import {
  getListingPageUrl,
  getPostShareUrl,
  getPostShareUtm,
} from "admindoor-blog/next";
import { buildBlogPostStructuredData, serializeJsonLd } from "admindoor-blog/seo";
import { BlogPostShare } from "./blog-post-share";
import { BlogAuthorSection } from "./blog-author-section";
import { BlogKeyTakeaways } from "./blog-key-takeaways";
import { BlogPostBreadcrumbs } from "./blog-post-breadcrumbs";
import { BlogPostContent } from "./blog-post-content";
import { BlogPostFaqs } from "./blog-post-faqs";
import { BlogPostTldr } from "./blog-post-tldr";
import { BlogRelatedPosts } from "./blog-related-posts";
import { BlogSection } from "./primitives/blog-section";
import { cn } from "./primitives/cn";
import type { BlogPostUi } from "./ui-types";

export interface BlogPostPageProps {
  config: BlogConfig;
  post: BlogPost;
  relatedPosts?: BlogPost[];
  homeHref?: string;
  className?: string;
  ui?: BlogPostUi;
}

export function BlogPostPage({
  config,
  post,
  relatedPosts = [],
  homeHref = "/",
  className,
  ui,
}: BlogPostPageProps) {
  const locale = config.locale ?? DEFAULT_LOCALE;
  const formattedDate = formatPostDate(post.publishedAt, locale);
  const structuredData = buildBlogPostStructuredData(config, post, { homeHref });
  const blogHref = getListingPageUrl(config, 1);
  const shareUrl = getPostShareUrl(config, post);
  const shareUtm = getPostShareUtm(config, post);
  const shareEnabled = config.postPage?.share?.enabled !== false;
  const classNames = ui?.classNames;
  const relatedCardClassNames = classNames?.card ?? classNames?.related?.card;

  return (
    <main
      data-blog-root
      className={cn(
        "blog-root min-h-screen bg-(--blog-surface)",
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

      <BlogSection className="pb-6! md:pb-8!">
        <div className="blog-page-width flex flex-col gap-5 md:gap-6">
          <BlogPostBreadcrumbs
            homeHref={homeHref}
            blogHref={blogHref}
            blogLabel={config.listing?.title ?? DEFAULT_LISTING_TITLE}
            postTitle={post.title}
            classNames={classNames?.breadcrumbs}
          />
          <h1
            className={cn(
              "w-full text-3xl font-semibold text-(--blog-fg) md:text-5xl lg:text-6xl",
              classNames?.title,
            )}
          >
            {post.title}
          </h1>
          <div
            data-slot="blog-post-meta"
            className={cn(
              "@container flex items-center justify-between gap-3",
              classNames?.meta,
            )}
          >
            <div
              data-slot="blog-post-byline"
              className={cn("flex min-w-0 items-center gap-3", classNames?.byline)}
            >
              {post.author ? (
                post.authorImage ? (
                  <Image
                    src={post.authorImage}
                    alt={post.author}
                    width={40}
                    height={40}
                    className={cn(
                      "size-10 shrink-0 rounded-full object-cover ring-2 ring-(--blog-border)",
                      classNames?.avatar,
                    )}
                  />
                ) : (
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-full bg-(--blog-surface-muted) text-sm font-medium text-(--blog-subtle-fg) ring-2 ring-(--blog-border)",
                      classNames?.avatar,
                    )}
                    aria-hidden
                  >
                    {post.author.charAt(0)}
                  </div>
                )
              ) : null}
              <div className="flex min-w-0 flex-col @[28rem]:flex-row @[28rem]:items-center @[28rem]:gap-3">
                {post.author ? (
                  <>
                    <p
                      title={post.author}
                      className={cn(
                        "min-w-0 truncate text-sm font-medium text-(--blog-fg) md:text-base",
                        classNames?.authorName,
                      )}
                    >
                      {post.author}
                    </p>
                    <span
                      className="hidden text-xs text-(--blog-muted-fg) @[28rem]:inline"
                      aria-hidden
                    >
                      ·
                    </span>
                  </>
                ) : null}
                <p
                  className={cn(
                    "shrink-0 text-xs whitespace-nowrap text-(--blog-muted-fg)",
                    classNames?.date,
                  )}
                >
                  {formattedDate}
                </p>
              </div>
            </div>
            {shareEnabled ? (
              <BlogPostShare
                url={shareUrl}
                title={post.title}
                platforms={config.postPage?.share?.platforms}
                utm={shareUtm}
                classNames={classNames?.share}
              />
            ) : null}
          </div>
          {post.imageUrl ? (
            <div
              className={cn(
                "relative aspect-video w-full overflow-hidden rounded-(--blog-radius-md)",
                classNames?.cover,
              )}
            >
              <Image
                src={post.imageUrl}
                alt={post.imageAlt ?? post.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          ) : null}
          {post.seo?.summary ? (
            <BlogPostTldr summary={post.seo.summary} classNames={classNames?.tldr} />
          ) : null}
        </div>
      </BlogSection>

      <BlogSection className="pt-0! pb-8! md:pb-10!">
        <div className="blog-page-width">
          <BlogPostContent html={post.content} />
        </div>
      </BlogSection>

      {post.seo?.keyTakeaways?.length ? (
        <BlogKeyTakeaways
          items={post.seo.keyTakeaways}
          classNames={classNames?.takeaways}
        />
      ) : null}

      {post.seo?.faqs?.length ? (
        <BlogPostFaqs items={post.seo.faqs} classNames={classNames?.faqs} />
      ) : null}

      {post.author ? (
        <BlogAuthorSection
          name={post.author}
          image={post.authorImage}
          about={post.authorAbout}
          classNames={classNames?.author}
        />
      ) : null}

      <BlogRelatedPosts
        config={config}
        posts={relatedPosts}
        classNames={classNames?.related}
        cardClassNames={relatedCardClassNames}
        renderCard={ui?.renderCard}
        cardFooter={ui?.cardFooter}
        ctaLabel={ui?.ctaLabel}
      />

      {config.postPage?.afterContent != null
        ? (config.postPage.afterContent as ReactNode)
        : null}
    </main>
  );
}
