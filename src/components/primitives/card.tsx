import type { ComponentProps } from "react";

import { cn } from "./cn";

export function BlogCard({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="blog-card"
      className={cn(
        "flex flex-col gap-0 overflow-hidden rounded-(--blog-radius) border border-(--blog-border) bg-(--blog-surface) text-(--blog-fg) shadow-sm transition-shadow group-hover:shadow-md",
        className,
      )}
      {...props}
    />
  );
}

export function BlogCardHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="blog-card-header"
      className={cn("flex flex-col gap-2 px-4 pt-4 pb-2 md:px-5", className)}
      {...props}
    />
  );
}

export function BlogCardTitle({ className, ...props }: ComponentProps<"h3">) {
  return (
    <h3
      data-slot="blog-card-title"
      className={cn(
        "line-clamp-2 text-base leading-snug font-semibold text-(--blog-fg) transition-colors group-hover:text-(--blog-accent) md:text-lg",
        className,
      )}
      {...props}
    />
  );
}

export function BlogCardDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="blog-card-description"
      className={cn(
        "line-clamp-3 text-sm leading-relaxed text-(--blog-subtle-fg)",
        className,
      )}
      {...props}
    />
  );
}

export function BlogCardContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="blog-card-content"
      className={cn(
        "flex flex-1 flex-col justify-between px-4 pt-0 pb-4 md:px-5",
        className,
      )}
      {...props}
    />
  );
}

export function BlogCardFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="blog-card-footer"
      className={cn("mt-4 flex items-center justify-between gap-3", className)}
      {...props}
    />
  );
}
