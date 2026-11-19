# admindoor-blog

[![npm](https://img.shields.io/npm/v/admindoor-blog)](https://www.npmjs.com/package/admindoor-blog)
[![CI](https://github.com/Radianz-Group/admindoor-blog/actions/workflows/ci.yml/badge.svg)](https://github.com/Radianz-Group/admindoor-blog/actions/workflows/ci.yml)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)

Full-stack SSG blog package for the Next.js App Router. Supply a config plus listing, post and OG image route files; the package handles data fetching, TipTap rendering, SEO metadata, JSON-LD, UI and static generation.

Built and maintained by [Radianzz Pvt. Ltd.](https://radianzz.com) as the blog setup kit for **Admindoor**, our content management platform. Admindoor is optional: the package ships an Admindoor adapter, but any source that implements `BlogContentSource` works (see [Content source](#1-blog-config)).

Requires **Node ≥ 20** and **Next.js ≥ 16**.

Optional weighted listing search is documented in [docs/search.md](./docs/search.md).

**Using an AI coding agent?** The package ships an [agent skill](./skills/README.md) that installs or upgrades the blog in your repo: copy `node_modules/admindoor-blog/skills/admindoor-blog` into `.claude/skills/` (or your agent's equivalent) and ask it to add a blog.

## Install

```bash
pnpm add admindoor-blog
```

Peer dependencies (minimums match `package.json`):

| Peer                  | Required              | Notes               |
| --------------------- | --------------------- | ------------------- |
| `next`                | `>=16.0.0`            | App Router          |
| `react` / `react-dom` | `>=19.0.0`            | —                   |
| `lucide-react`        | `>=0.400.0`           | Icons in chrome UI  |
| `sharp`               | `>=0.33.0` (optional) | OG JPEG compression |

```bash
pnpm add next@^16 react react-dom lucide-react
# optional but recommended for OG images:
pnpm add sharp
```

## Quick start (~30 minutes)

### 1. Blog config

Create `src/lib/blog-config.ts`:

```ts
import { createBlogConfig } from "admindoor-blog/next";

export const blogConfig = createBlogConfig({
  site: {
    name: "Your Site",
    url: "https://www.yoursite.com",
    logoUrl: "https://www.yoursite.com/logo.png", // optional — defaults to `{site.url}/logo.png`
    description: "Latest articles from our team.", // optional — Organization / WebSite
    legalName: "Your Site Inc.", // optional
    sameAs: [
      // optional — social / profile URLs for Organization schema
      "https://twitter.com/yoursite",
      "https://www.linkedin.com/company/yoursite",
    ],
    logoWidth: 512, // optional — ImageObject dims
    logoHeight: 512,
    twitterHandle: "@yoursite", // optional — twitter:site
  },
  content: {
    type: "admindoor",
    apiUrl: process.env.BLOG_API_URL ?? "",
  },
  listing: {
    eyebrow: "Blog",
    title: "Insights & Updates",
    subtitle: "Latest articles from our team.",
    postsPerPage: 12, // default 12
  },
  locale: "en-IN", // default en-IN
  postPage: {
    notFoundTitle: "Article not found",
    // afterContent: <YourSiteCta />, // optional React slot
  },
});
```

Set `BLOG_API_URL` to your Admindoor (or compatible) JSON endpoint. The package fetches at build/request time (in-memory cached per process; not persisted in Next.js fetch cache).

For a custom source, pass a `BlogContentSource` object instead of `{ type: "admindoor", apiUrl }`:

```ts
content: {
  async getPosts() {
    return [/* BlogPost[] */];
  },
},
```

### 2. Route files (three required)

**Listing** — `src/app/blog/p/[page]/page.tsx`:

```tsx
import { createBlogListingPage } from "admindoor-blog/next";
import { blogConfig } from "@/lib/blog-config";

const listingPage = createBlogListingPage(blogConfig);

export const generateStaticParams = listingPage.generateStaticParams;
export const generateMetadata = listingPage.generateMetadata;
export default listingPage.default;
```

**Post detail** — `src/app/blog/[slug]/page.tsx`:

```tsx
import { createBlogPostPage } from "admindoor-blog/next";
import { blogConfig } from "@/lib/blog-config";

const postPage = createBlogPostPage(blogConfig, { homeHref: "/" });

export const generateStaticParams = postPage.generateStaticParams;
export const generateMetadata = postPage.generateMetadata;
export default postPage.default;
```

**Post social embed image** — `src/app/blog/[slug]/opengraph-image.tsx` (and optional `twitter-image.tsx`):

```tsx
import {
  BLOG_OG_IMAGE_CONTENT_TYPE,
  BLOG_OG_IMAGE_SIZE,
  createBlogPostOpengraphImage,
} from "admindoor-blog/next";
import { blogConfig } from "@/lib/blog-config";

export const alt = "Blog cover";
export const size = BLOG_OG_IMAGE_SIZE;
export const contentType = BLOG_OG_IMAGE_CONTENT_TYPE;

export default createBlogPostOpengraphImage(blogConfig);
```

```tsx
// twitter-image.tsx — re-use the same cover
export { alt, contentType, default, size } from "./opengraph-image";
```

This serves the post cover as a 1200×630 JPEG so WhatsApp and similar crawlers show the embed image (large CDN PNGs are often dropped). **Required for social embeds** — `generateMetadata` always points `og:image` / `twitter:image` at this route (including a branded fallback when the post has no cover). Article JSON-LD `image` uses the same fallback URL when a post has no featured cover. Install optional peer `sharp` for compression.

### 3. Styles & site-level JSON-LD

In your root layout, import styles and inject Organization + WebSite schema:

```tsx
import "admindoor-blog/styles/blog.css";
import {
  buildOrganizationStructuredData,
  buildWebsiteStructuredData,
  serializeJsonLd,
} from "admindoor-blog/seo";
import { blogConfig } from "@/lib/blog-config";

const organizationSchema = buildOrganizationStructuredData(blogConfig);
const websiteSchema = buildWebsiteStructuredData(blogConfig);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
```

Post and listing pages already emit Article/BlogPosting, BreadcrumbList, FAQPage, and CollectionPage JSON-LD. Organization/`sameAs`/`description` come from `blogConfig.site`.

FAQ answers are included in the static HTML (accordion content uses `forceMount`), so crawlers can read Q&A without client interaction. FAQPage JSON-LD is emitted when a post has FAQs.

Key takeaways appear in Article JSON-LD as `hasPart` entries typed `CreativeWork` (with `text`). Do **not** use `ItemList` for `hasPart` — Schema.org rejects it (fixed in v0.5.1).

#### v0.6.0 SEO checklist (host app)

1. Fill `blogConfig.site` (`name`, `url`, `description`, `sameAs`, logo fields, `twitterHandle`).
2. Inject Organization + WebSite JSON-LD in the root layout (snippet above).
3. Add `opengraph-image.tsx` (and optional `twitter-image.tsx`) under each post route.
4. Prefer HTTPS cover images; when missing, metadata + Article JSON-LD fall back to the OG route.
5. Optionally add a sitemap (see [Sitemap](#6-sitemap)).

`blog.css` ships:

- **Chrome tokens** on `:root` / `.blog-root` (`--blog-*` CSS variables)
- **Layout** — `.blog-page-width`
- **TipTap body** — `.blog-content` (not wired to chrome tokens)

Listing and post pages render with `class="blog-root"` and `data-blog-root` so host overrides can target the chrome tree.

**Tailwind v4:** add a `@source` entry in your global CSS so utilities used inside `admindoor-blog` are generated. Published installs ship `dist` + `src/styles` only — **`dist` is the required scan path**; include `src` only when linking the package from this monorepo:

```css
@import "tailwindcss";
@source "../node_modules/admindoor-blog/dist";
/* monorepo / workspace link only: */
@source "../node_modules/admindoor-blog/src";
```

See [Theming & UI customization](#theming--ui-customization) for branding.

### 4. Redirects & build timeout

In `next.config.ts`:

```ts
import { getBlogRedirects } from "admindoor-blog/next";
import { blogConfig } from "./src/lib/blog-config";

export default {
  // Raise if `next build` fails with static generation timeouts.
  // Default is 60s; OG cover fetch + sharp per post can exceed that on larger blogs.
  staticPageGenerationTimeout: 180,
  async redirects() {
    return getBlogRedirects(blogConfig);
  },
};
```

This redirects `/blog` → `/blog/p/1` by default. Customize paths via `blogConfig.routes`.

`getBlogRedirects` is also available from `admindoor-blog/next/redirects` (same helper; use whichever import your bundler prefers).

**Build tip:** Static generation runs every listing/post page plus `opengraph-image` (and optional `twitter-image`) per slug. If the build errors with a message that static generation took longer than 60 seconds, set `staticPageGenerationTimeout` higher as above (e.g. `180` or `300`).

### 5. Images

Add remote image hosts used in post content and SEO to `next.config.ts`:

```ts
images: {
  remotePatterns: [
    { protocol: "https", hostname: "cdn.yoursite.com" },
  ],
},
```

Only `https://` image URLs are kept during TipTap sanitization.

### 6. Sitemap

Optional App Router sitemap using package helpers:

```ts
// src/app/sitemap.ts
import { createBlogDataLayer } from "admindoor-blog";
import { generateBlogSitemapEntries } from "admindoor-blog/seo";
import { blogConfig } from "@/lib/blog-config";

export default async function sitemap() {
  const { getAllPosts } = createBlogDataLayer(blogConfig);
  const posts = await getAllPosts();
  return generateBlogSitemapEntries(blogConfig, posts).map((entry) => ({
    url: entry.url,
    ...(entry.lastModified ? { lastModified: entry.lastModified } : {}),
  }));
}
```

## Package exports

| Import                              | Contents                                                                       |
| ----------------------------------- | ------------------------------------------------------------------------------ |
| `admindoor-blog`                    | Types, `createBlogConfig`, `createBlogDataLayer`, pagination helpers           |
| `admindoor-blog/next`               | `createBlogConfig`, route factories, redirects, path helpers, OG image factory |
| `admindoor-blog/next/redirects`     | `getBlogRedirects` only                                                        |
| `admindoor-blog/components`         | All React UI (optional — factories include pages)                              |
| `admindoor-blog/seo`                | Metadata, JSON-LD, `generateBlogSitemapEntries`                                |
| `admindoor-blog/adapters/admindoor` | Types, `createAdmindoorSource`, `normalizeAdmindoorPost`, `sortPostsByDate`    |
| `admindoor-blog/styles/blog.css`    | Chrome tokens, page width, TipTap `.blog-content`                              |

## Environment variables

| Variable       | Required      | Description                                 |
| -------------- | ------------- | ------------------------------------------- |
| `BLOG_API_URL` | For Admindoor | HTTPS URL returning `{ blogs: [...] }` JSON |

Build fails loudly if the API returns a non-OK response. An empty `apiUrl` yields an empty blog.

## Customization

Content and routing (not visual theme — see [Theming](#theming--ui-customization)):

- **Site / Organization** — `blogConfig.site` (`name`, `url`, `logoUrl` → defaults to `{site.url}/logo.png`, `description`, `legalName`, `sameAs`, `logoWidth`/`logoHeight`, `twitterHandle`)
- **Listing copy** — `blogConfig.listing` (`title`, `subtitle`, `eyebrow`, `emptyMessage`)
- **Post CTA** — `blogConfig.postPage.afterContent` (React node rendered after related posts)
- **Share button** — `blogConfig.postPage.share` (`enabled`, `platforms`, `getUrl`). The shared URL defaults to `site.url` + post path; `getUrl: (post, defaultUrl) => string` overrides it (e.g. `` `${defaultUrl}?utm_source=share` ``). An empty result falls back to the default.
- **Share link UTM tags** — off by default. Set `postPage.share.utm: { enabled: true }` and every share link gets `utm_source` (the platform; `copy_link` / `native_share` for the copy field and native sheet), `utm_medium` (`social`, `email` for email), `utm_campaign` (`blog_share`) and `utm_content` (post slug). Tune with `medium`, `campaign`, `term`, `content` (string or `(post) => string`), `sources` and `mediums` (per-channel overrides). Existing `utm_*` params on the URL are never overwritten.
- **Routes** — `blogConfig.routes.basePath` (default `/blog`), `listingPath` (default `/blog/p`)
- **Locale** — `blogConfig.locale` for date formatting (default `en-IN`)

Do **not** put colors or class maps in `createBlogConfig`. Use CSS tokens and/or the `ui` prop below.

## Theming & UI customization

This section is enough for a host app (or another AI agent) to brand the blog without reading package source.

### Chrome vs TipTap

| Layer           | What                                                                                                                                | How to customize                                                               |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Chrome**      | Listing/post shells, cards, headers, pagination, breadcrumbs, TLDR, takeaways, FAQs, author, related posts, badge/button primitives | CSS tokens + `ui` / `classNames` / slots                                       |
| **TipTap body** | Sanitized CMS HTML in `BlogPostContent` (`.blog-content`)                                                                           | **Not** themed by tokens/`ui`. Override `.blog-content` rules in host CSS only |

Chrome components: `BlogListingPage`, `BlogPostPage`, `BlogArticleGrid`, `BlogArticleCard`, `BlogPagination`, `BlogSectionHeader`, `BlogPostBreadcrumbs`, `BlogPostTldr`, `BlogKeyTakeaways`, `BlogPostFaqs`, `BlogAuthorSection`, `BlogRelatedPosts`, plus primitives (`BlogCard*`, `BlogBadge`, `BlogButton`, `BlogSection`).

### Parent / host CSS caveats

Package chrome uses unprefixed Tailwind utilities and shared cascade (no Shadow DOM, no Tailwind prefix). Host rules for `a`, `h1`–`h3`, `p`, `img` can affect the blog.

**Mitigations:**

1. Prefer `--blog-*` tokens and `ui.classNames` over broad element selectors.
2. Scope host overrides to `[data-blog-root]` / `.blog-root`.
3. Leave `.blog-content` alone unless you intend to restyle TipTap.
4. Keep the Tailwind `@source` entries so package utilities are generated.
5. Prefer scoped host overrides on `[data-blog-root]` over fighting package CSS; `blog.css` is unlayered so page width and TipTap styles beat Tailwind Preflight.

### Design tokens

Defaults live in `blog.css` on `:root` and `.blog-root`. Override on `.blog-root` (or `:root`) in the host app:

| Variable                 | Default                  | Affects                                 |
| ------------------------ | ------------------------ | --------------------------------------- |
| `--blog-accent`          | `rgb(3 105 161)`         | Links, card title hover, accent accents |
| `--blog-accent-muted`    | `rgb(240 249 255)`       | Secondary badge background              |
| `--blog-accent-fg`       | `rgb(7 89 133)`          | Secondary badge text                    |
| `--blog-surface`         | `rgb(255 255 255)`       | Cards, post page background, panels     |
| `--blog-surface-muted`   | `rgb(248 250 252)`       | Muted panels, placeholders              |
| `--blog-page-bg`         | `rgb(248 250 252 / 0.8)` | Listing page / related posts background |
| `--blog-border`          | `rgb(226 232 240 / 0.8)` | Borders, rings                          |
| `--blog-radius`          | `0.75rem`                | Cards                                   |
| `--blog-radius-md`       | `0.375rem`               | Badges, buttons, small panels           |
| `--blog-fg`              | `rgb(15 23 42)`          | Primary text / headings                 |
| `--blog-muted-fg`        | `rgb(100 116 139)`       | Eyebrows, dates, separators             |
| `--blog-subtle-fg`       | `rgb(71 85 105)`         | Body/secondary text                     |
| `--blog-focus-ring`      | `rgb(148 163 184)`       | Focus rings                             |
| `--blog-button-bg`       | `rgb(15 23 42)`          | Primary button background               |
| `--blog-button-bg-hover` | `rgb(30 41 59)`          | Primary button hover                    |
| `--blog-button-fg`       | `rgb(255 255 255)`       | Primary button text                     |

```css
/* e.g. src/app/globals.css — after importing blog.css */
.blog-root {
  --blog-accent: #e85d3a;
  --blog-accent-muted: #fde8e0;
  --blog-accent-fg: #c2410c;
  --blog-radius: 1rem;
}
```

### `ui` prop API

Pass `ui` into page components or route factories. Factories forward it:

```ts
createBlogListingPage(blogConfig, { ui: listingUi });
createBlogPostPage(blogConfig, { homeHref: "/", ui: postUi });
```

Or compose pages directly:

```tsx
import { BlogListingPage, BlogPostPage } from "admindoor-blog/components";
```

#### `BlogListingUi`

```ts
import type { BlogListingUi } from "admindoor-blog/components";

const listingUi: BlogListingUi = {
  classNames: {
    root?: string;
    header?: { root?, eyebrow?, title?, subtitle? };
    card?: { root?, card?, image?, badge?, meta?, title?, description?, footer?, cta? };
    pagination?: { root?, list?, link?, current?, disabled?, ellipsis? };
    empty?: string;
    grid?: { root?, list?, header?, card? };
  },
  renderCard?: (article) => ReactNode, // full card replace
  cardFooter?: ReactNode,              // replace author block on every card
  ctaLabel?: string,                   // default "Read more"
};
```

#### `BlogPostUi`

```ts
import type { BlogPostUi } from "admindoor-blog/components";

const postUi: BlogPostUi = {
  classNames: {
    root?, title?, meta?, cover?,
    breadcrumbs?: { root?, list?, item?, separator?, current? },
    tldr?: { root?, title?, body? },
    takeaways?: { root?, title?, box?, item?, bullet? },
    faqs?: { root?, title?, box?, item?, trigger?, content? },
    author?: { root?, label?, name?, about?, avatar? },
    related?: { root?, list?, header?, card? },
    card?: { /* same keys as listing card; applied to related posts */ },
  },
  renderCard?, cardFooter?, ctaLabel?,
};
```

Structural slots (`footer` / `cardFooter`, `ctaLabel`, `renderCard`) change markup; `classNames` only merge Tailwind classes via `cn` / `tailwind-merge`.

### Host recipes

#### Recipe A — tokens only

1. Import `blog.css` in the root layout (already required).
2. In `globals.css`, set `.blog-root { --blog-accent: …; … }`.
3. No React changes. Listing/post pages already mount `.blog-root`.

#### Recipe B — branded cards

`src/lib/blog-ui.tsx`:

```tsx
import type { BlogListingUi, BlogPostUi } from "admindoor-blog/components";

const brandFooter = (
  <div className="flex items-center gap-2">
    <span className="flex size-6 items-center justify-center rounded bg-[#e85d3a] text-xs font-bold text-white">
      A
    </span>
    <span className="text-sm font-medium text-(--blog-fg)">Acme</span>
  </div>
);

const cardClassNames = {
  badge: "rounded-full bg-[#fde8e0] text-[#c2410c] border-transparent",
  cta: "rounded-full",
};

export const listingUi: BlogListingUi = {
  cardFooter: brandFooter,
  ctaLabel: "Read more",
  classNames: { card: cardClassNames },
};

export const postUi: BlogPostUi = {
  cardFooter: brandFooter,
  ctaLabel: "Read more",
  classNames: { card: cardClassNames },
};
```

Wire factories:

```tsx
// src/app/blog/p/[page]/page.tsx
import { createBlogListingPage } from "admindoor-blog/next";
import { blogConfig } from "@/lib/blog-config";
import { listingUi } from "@/lib/blog-ui";

const listingPage = createBlogListingPage(blogConfig, { ui: listingUi });
// …export generateStaticParams, generateMetadata, default
```

```tsx
// src/app/blog/[slug]/page.tsx
import { createBlogPostPage } from "admindoor-blog/next";
import { blogConfig } from "@/lib/blog-config";
import { postUi } from "@/lib/blog-ui";

const postPage = createBlogPostPage(blogConfig, { homeHref: "/", ui: postUi });
```

#### Recipe C — full chrome classNames

```ts
const listingUi: BlogListingUi = {
  classNames: {
    root: "bg-white",
    header: { title: "font-bold tracking-tight", eyebrow: "text-[#e85d3a]" },
    pagination: { current: "bg-[#e85d3a] border-[#e85d3a]" },
    card: { title: "text-lg", description: "line-clamp-2" },
  },
};

const postUi: BlogPostUi = {
  classNames: {
    title: "font-bold",
    breadcrumbs: { item: "text-[#e85d3a]" },
    tldr: { root: "border-[#e85d3a]/30 bg-[#fde8e0]/40" },
    takeaways: { bullet: "bg-[#e85d3a]" },
    faqs: { trigger: "font-medium" },
  },
};
```

#### Recipe D — replace the card entirely

```tsx
import {
  BlogArticleCard,
  type BlogArticleCardData,
  type BlogListingUi,
} from "admindoor-blog/components";

export const listingUi: BlogListingUi = {
  renderCard: (article: BlogArticleCardData) => (
    <BlogArticleCard
      {...article}
      footer={<YourBrandMark />}
      classNames={{ cta: "rounded-full bg-[#fde8e0]" }}
    />
  ),
};
```

Or build a fully custom card from exported primitives (`BlogCard`, `BlogBadge`, `BlogButton`, …).

### `data-slot` escape hatch

Stable attributes for host CSS when `classNames` is not enough:

| `data-slot`                                                                                                 | Element        |
| ----------------------------------------------------------------------------------------------------------- | -------------- |
| `blog-article-card`                                                                                         | Card link root |
| `blog-card`                                                                                                 | Card surface   |
| `blog-card-header` / `blog-card-title` / `blog-card-description` / `blog-card-content` / `blog-card-footer` | Card parts     |
| `blog-badge` / `blog-button`                                                                                | Primitives     |
| `blog-section-header` / `blog-section-eyebrow` / `blog-section-title` / `blog-section-subtitle`             | Section header |
| `blog-article-grid`                                                                                         | Grid list      |
| `blog-pagination`                                                                                           | Pagination nav |
| `blog-breadcrumbs`                                                                                          | Breadcrumbs    |
| `blog-tldr` / `blog-key-takeaways` / `blog-faqs` / `blog-author`                                            | Post sections  |

Also: `data-blog-root` on listing/post `<main>`.

```css
[data-blog-root] [data-slot="blog-badge"] {
  border-radius: 9999px;
}
```

### Do / don’t (for integrating agents)

#### Do

- Install `admindoor-blog@1.0.0` on Next.js ≥ 16 / Node ≥ 20
- Set `--blog-*` tokens on `.blog-root`
- Pass `ui` to `createBlogListingPage` / `createBlogPostPage` (or page components)
- Import UI from `admindoor-blog/components`
- Scope host CSS to `[data-blog-root]`
- Follow the [v0.6.0 SEO checklist](#v060-seo-checklist-host-app)

#### Don’t

- Fork package components into the host app
- Put theme/colors in `createBlogConfig`
- Expect chrome tokens to restyle TipTap (`.blog-content`)
- Expect Shadow DOM / full style isolation
- Use broad `a { … }` / `h1 { … }` under the blog tree without scoping
- Skip `opengraph-image.tsx` if you care about WhatsApp / social embeds

## Example app

A working integration lives in `examples/minimal-next-app`:

```bash
pnpm install
pnpm build
pnpm --filter minimal-next-app dev
```

Open [http://localhost:3000/blog/p/1](http://localhost:3000/blog/p/1).

The example uses bundled JSON by default so `next build` works without a running API. To test the Admindoor adapter in dev:

```bash
BLOG_API_URL=http://localhost:3000/api/blogs pnpm --filter minimal-next-app dev
```

## Development

```bash
pnpm install
pnpm dev          # watch package build
pnpm test
pnpm build:example # package + example production build
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full workflow and release process.

## Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup and guidelines, and [SECURITY.md](./SECURITY.md) to report a vulnerability.

## License

[Apache License 2.0](./LICENSE). Copyright 2026 Radianzz Pvt. Ltd. See [NOTICE](./NOTICE).
