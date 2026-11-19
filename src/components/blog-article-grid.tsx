import type { ReactNode } from "react";

import { BlogArticleCard, type BlogArticleCardProps } from "./blog-article-card";
import { BlogSection } from "./primitives/blog-section";
import { BlogSectionHeader } from "./primitives/blog-section-header";
import { cn } from "./primitives/cn";
import type { BlogArticleCardData, BlogArticleGridClassNames } from "./ui-types";

export interface BlogArticleGridProps {
  id?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  headingLevel?: "h1" | "h2";
  articles: BlogArticleCardData[];
  className?: string;
  classNames?: BlogArticleGridClassNames;
  renderCard?: (article: BlogArticleCardData) => ReactNode;
  cardFooter?: ReactNode;
  ctaLabel?: string;
  cardClassNames?: BlogArticleCardProps["classNames"];
}

export function BlogArticleGrid({
  id,
  eyebrow,
  title,
  subtitle,
  headingLevel = "h2",
  articles,
  className,
  classNames,
  renderCard,
  cardFooter,
  ctaLabel,
  cardClassNames,
}: BlogArticleGridProps) {
  if (!articles.length) return null;

  const resolvedCardClassNames = cardClassNames ?? classNames?.card;

  return (
    <BlogSection id={id} className={cn(classNames?.root, className)}>
      <div className="space-y-8 md:space-y-10">
        <BlogSectionHeader
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
          headingLevel={headingLevel}
          align="left"
          classNames={classNames?.header}
        />
        <div
          data-slot="blog-article-grid"
          className={cn("grid gap-6 sm:grid-cols-2 xl:grid-cols-3", classNames?.list)}
        >
          {articles.map((article) =>
            renderCard ? (
              <div key={article.href}>{renderCard(article)}</div>
            ) : (
              <BlogArticleCard
                key={article.href}
                {...article}
                classNames={resolvedCardClassNames}
                footer={cardFooter}
                ctaLabel={ctaLabel}
              />
            ),
          )}
        </div>
      </div>
    </BlogSection>
  );
}
