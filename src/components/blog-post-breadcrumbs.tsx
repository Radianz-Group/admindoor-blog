import Link from "next/link";

import { cn } from "./primitives/cn";
import type { BlogPostBreadcrumbsClassNames } from "./ui-types";

export interface BlogPostBreadcrumbsProps {
  homeHref: string;
  blogHref: string;
  blogLabel?: string;
  postTitle: string;
  className?: string;
  classNames?: BlogPostBreadcrumbsClassNames;
}

export function BlogPostBreadcrumbs({
  homeHref,
  blogHref,
  blogLabel = "Blog",
  postTitle,
  className,
  classNames,
}: BlogPostBreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      data-slot="blog-breadcrumbs"
      className={cn(className, classNames?.root)}
    >
      <ol
        className={cn(
          "flex flex-wrap items-center gap-1.5 text-sm text-(--blog-subtle-fg)",
          classNames?.list,
        )}
      >
        <li>
          <Link
            href={homeHref}
            className={cn("hover:text-(--blog-fg)", classNames?.item)}
          >
            Home
          </Link>
        </li>
        <li aria-hidden className={cn("text-(--blog-muted-fg)", classNames?.separator)}>
          /
        </li>
        <li>
          <Link
            href={blogHref}
            className={cn("hover:text-(--blog-fg)", classNames?.item)}
          >
            {blogLabel}
          </Link>
        </li>
        <li aria-hidden className={cn("text-(--blog-muted-fg)", classNames?.separator)}>
          /
        </li>
        <li
          className={cn(
            "line-clamp-1 max-w-56 font-medium text-(--blog-fg) sm:max-w-xs md:max-w-md",
            classNames?.current,
          )}
          aria-current="page"
        >
          {postTitle}
        </li>
      </ol>
    </nav>
  );
}
