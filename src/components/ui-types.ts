import type { ReactNode } from "react";

export type BlogClassNames<T extends string> = Partial<Record<T, string>>;

export type BlogSectionHeaderClassNames = BlogClassNames<
  "root" | "eyebrow" | "title" | "subtitle"
>;

export type BlogArticleCardClassNames = BlogClassNames<
  | "root"
  | "card"
  | "image"
  | "badge"
  | "meta"
  | "title"
  | "description"
  | "footer"
  | "cta"
>;

export type BlogPaginationClassNames = BlogClassNames<
  "root" | "list" | "link" | "current" | "disabled" | "ellipsis"
>;

export type BlogSearchClassNames = BlogClassNames<
  "root" | "form" | "input" | "button" | "empty"
>;

export type BlogPostBreadcrumbsClassNames = BlogClassNames<
  "root" | "list" | "item" | "separator" | "current"
>;

export type BlogPostTldrClassNames = BlogClassNames<"root" | "title" | "body">;

export type BlogKeyTakeawaysClassNames = BlogClassNames<
  "root" | "title" | "box" | "item" | "bullet"
>;

export type BlogPostFaqsClassNames = BlogClassNames<
  "root" | "title" | "box" | "item" | "trigger" | "content"
>;

export type BlogAuthorSectionClassNames = BlogClassNames<
  "root" | "label" | "name" | "about" | "avatar"
>;

export type BlogArticleGridClassNames = BlogClassNames<"root" | "list"> & {
  header?: BlogSectionHeaderClassNames;
  card?: BlogArticleCardClassNames;
};

export type BlogPostShareClassNames = BlogClassNames<
  | "trigger"
  | "triggerIcon"
  | "triggerLabel"
  | "overlay"
  | "content"
  | "header"
  | "title"
  | "description"
  | "list"
  | "item"
  | "itemLabel"
  | "copyRow"
  | "input"
  | "copyButton"
>;

export type BlogPostPageClassNames = {
  share?: BlogPostShareClassNames;
  root?: string;
  title?: string;
  meta?: string;
  byline?: string;
  avatar?: string;
  authorName?: string;
  date?: string;
  cover?: string;
  breadcrumbs?: BlogPostBreadcrumbsClassNames;
  tldr?: BlogPostTldrClassNames;
  takeaways?: BlogKeyTakeawaysClassNames;
  faqs?: BlogPostFaqsClassNames;
  author?: BlogAuthorSectionClassNames;
  related?: BlogArticleGridClassNames;
  card?: BlogArticleCardClassNames;
};

export type BlogListingPageClassNames = {
  root?: string;
  header?: BlogSectionHeaderClassNames;
  card?: BlogArticleCardClassNames;
  pagination?: BlogPaginationClassNames;
  search?: BlogSearchClassNames;
  empty?: string;
  grid?: BlogArticleGridClassNames;
};

/** Data passed to article cards / renderCard (no UI override props). */
export interface BlogArticleCardData {
  href: string;
  title: string;
  description?: string;
  date?: string;
  category?: string;
  author?: string;
  authorImage?: string;
  imageUrl?: string;
  imageAlt?: string;
}

export interface BlogListingUi {
  classNames?: BlogListingPageClassNames;
  renderCard?: (article: BlogArticleCardData) => ReactNode;
  cardFooter?: ReactNode;
  ctaLabel?: string;
}

export interface BlogPostUi {
  classNames?: BlogPostPageClassNames;
  renderCard?: (article: BlogArticleCardData) => ReactNode;
  cardFooter?: ReactNode;
  ctaLabel?: string;
}
