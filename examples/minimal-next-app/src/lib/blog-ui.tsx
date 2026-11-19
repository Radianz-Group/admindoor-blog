import type { BlogListingUi, BlogPostUi } from "admindoor-blog/components";

/**
 * Demo chrome overrides for the minimal example.
 * Tokens in globals.css handle brand colors; this wires classNames + card slots.
 *
 * Fixture note: `structured-finance-outlook-2025` uses a long `primaryTopic` so listing
 * cards show CSS ellipsis; other posts use short topics for fit-content badges.
 */
const cardClassNames = {
  meta: "w-full",
  badge: "rounded-full",
  cta: "rounded-full",
};

const brandFooter = (
  <div className="flex items-center gap-2">
    <span className="flex size-6 items-center justify-center rounded bg-(--blog-accent) text-xs font-bold text-white">
      D
    </span>
    <span className="text-sm font-medium text-(--blog-fg)">Demo Blog</span>
  </div>
);

export const listingUi: BlogListingUi = {
  cardFooter: brandFooter,
  ctaLabel: "Read more",
  classNames: {
    header: {
      eyebrow: "text-(--blog-accent)",
    },
    card: cardClassNames,
    search: {
      button: "rounded-full",
      input: "rounded-full",
    },
  },
};

export const postUi: BlogPostUi = {
  cardFooter: brandFooter,
  ctaLabel: "Read more",
  classNames: {
    breadcrumbs: {
      item: "hover:text-(--blog-accent)",
    },
    tldr: {
      root: "border-(--blog-accent)/25",
    },
    takeaways: {
      bullet: "bg-(--blog-accent)",
    },
    card: cardClassNames,
  },
};
