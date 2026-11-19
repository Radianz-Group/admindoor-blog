import Image from "next/image";

import { BlogSection } from "./primitives/blog-section";
import { cn } from "./primitives/cn";
import type { BlogAuthorSectionClassNames } from "./ui-types";

export interface BlogAuthorSectionProps {
  name: string;
  image?: string;
  about?: string;
  className?: string;
  classNames?: BlogAuthorSectionClassNames;
}

export function BlogAuthorSection({
  name,
  image,
  about,
  className,
  classNames,
}: BlogAuthorSectionProps) {
  const hasAbout = Boolean(about?.trim());

  return (
    <BlogSection className="py-8! md:py-10!">
      <aside
        data-slot="blog-author"
        className={cn(
          "blog-page-width rounded-(--blog-radius-md) border border-(--blog-border) bg-(--blog-surface)/70 p-5 md:p-6",
          className,
          classNames?.root,
        )}
      >
        <p
          className={cn(
            "mb-4 text-xs font-semibold tracking-wide text-(--blog-muted-fg) uppercase",
            classNames?.label,
          )}
        >
          About the author
        </p>
        <div
          className={cn(
            "flex flex-col gap-4 sm:flex-row",
            hasAbout ? "sm:items-start" : "sm:items-center",
          )}
        >
          {image ? (
            <Image
              src={image}
              alt={name}
              width={72}
              height={72}
              className={cn(
                "size-16 shrink-0 rounded-full object-cover sm:size-18",
                classNames?.avatar,
              )}
            />
          ) : (
            <div
              className={cn(
                "flex size-16 shrink-0 items-center justify-center rounded-full bg-(--blog-surface-muted) text-lg font-semibold text-(--blog-subtle-fg) sm:size-18",
                classNames?.avatar,
              )}
              aria-hidden
            >
              {name.charAt(0)}
            </div>
          )}
          <div className={cn("min-w-0", hasAbout && "space-y-2")}>
            <p
              className={cn(
                "text-sm font-medium text-(--blog-fg) md:text-base",
                classNames?.name,
              )}
            >
              {name}
            </p>
            {about?.trim() ? (
              <p
                className={cn(
                  "text-sm text-(--blog-subtle-fg) md:text-base",
                  classNames?.about,
                )}
              >
                {about}
              </p>
            ) : null}
          </div>
        </div>
      </aside>
    </BlogSection>
  );
}
