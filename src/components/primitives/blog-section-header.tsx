import { cn } from "./cn";
import type { BlogSectionHeaderClassNames } from "../ui-types";

export interface BlogSectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  headingLevel?: "h1" | "h2";
  className?: string;
  classNames?: BlogSectionHeaderClassNames;
}

export function BlogSectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
  headingLevel = "h2",
  className,
  classNames,
}: BlogSectionHeaderProps) {
  const Heading = headingLevel;

  return (
    <div
      data-slot="blog-section-header"
      className={cn(
        "space-y-2",
        align === "center" ? "text-center" : "text-left",
        className,
        classNames?.root,
      )}
    >
      {eyebrow ? (
        <p
          data-slot="blog-section-eyebrow"
          className={cn(
            "text-xs font-semibold tracking-wide text-(--blog-muted-fg) uppercase",
            classNames?.eyebrow,
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <Heading
        data-slot="blog-section-title"
        className={cn(
          "text-2xl font-semibold text-(--blog-fg) md:text-3xl",
          classNames?.title,
        )}
      >
        {title}
      </Heading>
      {subtitle ? (
        <p
          data-slot="blog-section-subtitle"
          className={cn(
            "text-sm text-(--blog-subtle-fg) md:text-base",
            classNames?.subtitle,
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
