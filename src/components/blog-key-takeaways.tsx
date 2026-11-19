import { BlogSection } from "./primitives/blog-section";
import { cn } from "./primitives/cn";
import type { BlogKeyTakeawaysClassNames } from "./ui-types";

export interface BlogKeyTakeawaysProps {
  items: string[];
  title?: string;
  className?: string;
  classNames?: BlogKeyTakeawaysClassNames;
}

export function BlogKeyTakeaways({
  items,
  title = "Key Takeaways",
  className,
  classNames,
}: BlogKeyTakeawaysProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <BlogSection className="py-8! md:py-10!">
      <div
        data-slot="blog-key-takeaways"
        className={cn("blog-page-width space-y-4", className, classNames?.root)}
      >
        <h2
          className={cn(
            "text-xl font-semibold text-(--blog-fg) md:text-2xl",
            classNames?.title,
          )}
        >
          {title}
        </h2>
        <div
          className={cn(
            "rounded-(--blog-radius-md) border border-(--blog-border) bg-(--blog-surface-muted)/80 px-5 py-4 md:px-6 md:py-5",
            classNames?.box,
          )}
        >
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item}
                className={cn(
                  "flex gap-3 text-sm text-(--blog-subtle-fg) md:text-base",
                  classNames?.item,
                )}
              >
                <span
                  className={cn(
                    "mt-2 size-1.5 shrink-0 rounded-full bg-(--blog-fg)",
                    classNames?.bullet,
                  )}
                  aria-hidden
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </BlogSection>
  );
}
