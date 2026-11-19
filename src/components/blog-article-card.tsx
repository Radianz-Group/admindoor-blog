import { FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { DEFAULT_ARTICLE_CARD_CTA_LABEL } from "admindoor-blog/constants";
import { BlogBadge } from "./primitives/badge";
import { BlogButton } from "./primitives/button";
import {
  BlogCard,
  BlogCardContent,
  BlogCardDescription,
  BlogCardFooter,
  BlogCardHeader,
  BlogCardTitle,
} from "./primitives/card";
import { cn } from "./primitives/cn";
import type { BlogArticleCardClassNames, BlogArticleCardData } from "./ui-types";

export interface BlogArticleCardProps extends BlogArticleCardData {
  className?: string;
  classNames?: BlogArticleCardClassNames;
  footer?: ReactNode;
  ctaLabel?: string;
}

export function BlogArticleCard({
  href,
  title,
  description,
  date,
  category,
  author,
  authorImage,
  imageUrl,
  imageAlt,
  className,
  classNames,
  footer,
  ctaLabel = DEFAULT_ARTICLE_CARD_CTA_LABEL,
}: BlogArticleCardProps) {
  const footerContent =
    footer !== undefined ? (
      footer
    ) : author ? (
      <div className="flex min-w-0 items-center gap-2">
        {authorImage ? (
          <Image
            src={authorImage}
            alt={author}
            width={28}
            height={28}
            className="size-7 shrink-0 rounded-full object-cover ring-1 ring-(--blog-border)"
          />
        ) : (
          <div
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-(--blog-surface-muted) text-xs font-semibold text-(--blog-subtle-fg) ring-1 ring-(--blog-border)"
            aria-hidden
          >
            {author.charAt(0)}
          </div>
        )}
        <span className="truncate text-xs font-medium text-(--blog-subtle-fg)">
          {author}
        </span>
      </div>
    ) : (
      <span aria-hidden />
    );

  return (
    <Link
      href={href}
      data-slot="blog-article-card"
      className={cn(
        "group block h-full rounded-(--blog-radius) focus-visible:ring-2 focus-visible:ring-(--blog-focus-ring) focus-visible:ring-offset-2 focus-visible:outline-none",
        className,
        classNames?.root,
      )}
    >
      <BlogCard className={cn("h-full", classNames?.card)}>
        {imageUrl ? (
          <div
            className={cn(
              "relative aspect-16/10 w-full shrink-0 overflow-hidden bg-(--blog-surface-muted)",
              classNames?.image,
            )}
          >
            <Image
              src={imageUrl}
              alt={imageAlt ?? title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              sizes="(min-width: 1024px) 360px, (min-width: 768px) 50vw, 100vw"
            />
          </div>
        ) : (
          <div
            className={cn(
              "relative flex aspect-16/10 w-full shrink-0 items-center justify-center overflow-hidden bg-linear-to-br from-(--blog-surface-muted) via-(--blog-surface) to-(--blog-surface-muted)",
              classNames?.image,
            )}
            aria-hidden
          >
            <FileText
              className="size-10 text-(--blog-muted-fg)/90"
              strokeWidth={1.25}
            />
          </div>
        )}

        <BlogCardHeader>
          <div
            className={cn(
              "flex min-w-0 items-center justify-between gap-2 overflow-hidden text-xs text-(--blog-muted-fg)",
              classNames?.meta,
            )}
          >
            {category ? (
              <div className="min-w-0 max-w-full overflow-hidden">
                <BlogBadge
                  variant="secondary"
                  className={cn("uppercase", classNames?.badge)}
                >
                  {category}
                </BlogBadge>
              </div>
            ) : (
              <span aria-hidden />
            )}
            {date ? (
              <time className="shrink-0" dateTime={date}>
                {date}
              </time>
            ) : null}
          </div>
          <BlogCardTitle className={classNames?.title}>{title}</BlogCardTitle>
        </BlogCardHeader>

        <BlogCardContent>
          {description ? (
            <BlogCardDescription className={classNames?.description}>
              {description}
            </BlogCardDescription>
          ) : (
            <span className="flex-1" aria-hidden />
          )}

          <BlogCardFooter className={classNames?.footer}>
            {footerContent}
            <BlogButton
              variant="outline"
              size="sm"
              tabIndex={-1}
              className={cn(
                "pointer-events-none shrink-0 rounded-full",
                classNames?.cta,
              )}
              asChild
            >
              <span>
                {ctaLabel}
                <span aria-hidden>→</span>
              </span>
            </BlogButton>
          </BlogCardFooter>
        </BlogCardContent>
      </BlogCard>
    </Link>
  );
}
