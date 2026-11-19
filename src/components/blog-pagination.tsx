import { getPageNumbers } from "admindoor-blog";
import { DEFAULT_BLOG_LISTING_PATH } from "admindoor-blog/constants";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { BlogButton } from "./primitives/button";
import { cn } from "./primitives/cn";
import type { BlogPaginationClassNames } from "./ui-types";

export interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
  className?: string;
  classNames?: BlogPaginationClassNames;
}

export function BlogPagination({
  currentPage,
  totalPages,
  basePath = DEFAULT_BLOG_LISTING_PATH,
  className,
  classNames,
}: BlogPaginationProps) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(currentPage, totalPages);
  const previousPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  return (
    <nav
      aria-label="Blog pagination"
      data-slot="blog-pagination"
      className={cn("flex justify-center", className, classNames?.root)}
    >
      <ul className={cn("flex flex-wrap items-center gap-2", classNames?.list)}>
        <li>
          {previousPage ? (
            <BlogButton variant="outline" className={classNames?.link} asChild>
              <Link href={`${basePath}/${previousPage}`} aria-label="Previous page">
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Link>
            </BlogButton>
          ) : (
            <BlogButton
              variant="outline"
              disabled
              aria-hidden
              className={classNames?.disabled}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </BlogButton>
          )}
        </li>

        {pageNumbers.map((page, index) => {
          const previousNumber = pageNumbers[index - 1];
          const showEllipsis =
            previousNumber !== undefined && page - previousNumber > 1;
          const isCurrent = page === currentPage;

          return (
            <li key={page} className="flex items-center gap-2">
              {showEllipsis ? (
                <span
                  className={cn(
                    "px-1 text-sm text-(--blog-muted-fg)",
                    classNames?.ellipsis,
                  )}
                >
                  …
                </span>
              ) : null}
              <BlogButton
                variant={isCurrent ? "default" : "outline"}
                asChild={!isCurrent}
                aria-current={isCurrent ? "page" : undefined}
                className={isCurrent ? classNames?.current : classNames?.link}
              >
                {isCurrent ? (
                  <span>{page}</span>
                ) : (
                  <Link href={`${basePath}/${page}`}>{page}</Link>
                )}
              </BlogButton>
            </li>
          );
        })}

        <li>
          {nextPage ? (
            <BlogButton variant="outline" className={classNames?.link} asChild>
              <Link href={`${basePath}/${nextPage}`} aria-label="Next page">
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </BlogButton>
          ) : (
            <BlogButton
              variant="outline"
              disabled
              aria-hidden
              className={classNames?.disabled}
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </BlogButton>
          )}
        </li>
      </ul>
    </nav>
  );
}
