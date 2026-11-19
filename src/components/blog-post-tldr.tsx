import { cn } from "./primitives/cn";
import type { BlogPostTldrClassNames } from "./ui-types";

export interface BlogPostTldrProps {
  summary: string;
  className?: string;
  classNames?: BlogPostTldrClassNames;
}

export function BlogPostTldr({ summary, className, classNames }: BlogPostTldrProps) {
  const text = summary.trim();

  if (!text) {
    return null;
  }

  return (
    <aside
      data-slot="blog-tldr"
      className={cn(
        "rounded-(--blog-radius-md)er border-(--blog-border) bg-(--blog-surface-muted)/80 p-5 md:p-6",
        className,
        classNames?.root,
      )}
    >
      <h2
        className={cn(
          "mb-3 text-xs font-semibold tracking-wide text-(--blog-muted-fg) uppercase",
          classNames?.title,
        )}
      >
        TLDR
      </h2>
      <p
        className={cn(
          "text-sm leading-relaxed text-(--blog-subtle-fg) md:text-base",
          classNames?.body,
        )}
      >
        {text}
      </p>
    </aside>
  );
}
