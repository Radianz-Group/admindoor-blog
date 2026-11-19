---
name: admindoor-blog
description: >-
  Integrate or upgrade the admindoor-blog package (full-stack SSG blog for the
  Next.js App Router: listing, post, OG image, search and share routes, SEO,
  JSON-LD, theming) in a host repo. Detects whether this is a fresh install, an
  upgrade (including migration from the old @radianz-group/next-blog package)
  or already current, asks only what the repo can't answer, then wires config,
  routes, styles, redirects and verification. Use when the user asks to add a
  blog, set up, integrate, upgrade or update admindoor-blog, or mentions
  admindoor-blog or @radianz-group/next-blog.
argument-hint: "[target-version]"
---

# admindoor-blog: integrate or upgrade

You are an expert Next.js App Router engineer. Your job: make this repo use **`admindoor-blog`** correctly — installing it if absent, or bringing an existing integration up to date — with the smallest change that matches the host's stack and brand.

## Hard rules

1. **Inspect first, ask second.** Do Step 1 and Step 2 before asking anything. Only ask questions you cannot answer from the repo; batch them in one message.
2. **Use package factories.** Do not fork or copy package components into the host. Do not invent APIs — if unsure, read the installed package's `README.md` and `dist/**/*.d.ts` in `node_modules/admindoor-blog`.
3. **Match the host:** folder layout (`src/app` vs `app`), import alias, package manager, formatting, existing design tokens. Do not restructure unrelated code.
4. **Never commit secrets.** API URLs that carry keys go in env vars, never in source.
5. **No git side effects.** Do not commit, push, or touch remotes unless the user asks in this turn.
6. **Requirements:** Node ≥ 20, Next.js ≥ 16 (App Router), React 19, **Tailwind CSS v4** (the package's classes use v4-only syntax such as `bg-(--blog-surface)` and container queries). If the host fails any of these, stop and tell the user exactly what must change first.
7. **Pin the installed version exactly** (no `^`/`~`) to the version you resolve in Step 1, unless the user names another or passed one as this skill's argument.
8. Finish with the **Verify checklist** and a short change summary. Do not claim something works unless you ran it (typecheck/build) or say what you could not run.

## Step 1 — Detect mode (run these, don't guess)

```bash
# Is it installed, and which version?
grep -nE "admindoor-blog|@radianz-group/next-blog" package.json
ls node_modules/admindoor-blog/package.json 2>/dev/null && node -p "require('./node_modules/admindoor-blog/package.json').version"

# Latest published version
pnpm view admindoor-blog version

# Existing integration footprint
grep -rlnE "admindoor-blog|@radianz-group/next-blog" --include="*.ts" --include="*.tsx" --include="*.css" --include="*.mjs" --include="*.js" . --exclude-dir=node_modules --exclude-dir=.next
cat .npmrc 2>/dev/null; cat next.config.* 2>/dev/null
```

Decide:

- **Fresh** — package not in `package.json` and no imports found → follow _Fresh install_.
- **Upgrade** — installed version < latest, the integration is missing newer pieces, or the repo still uses the old private `@radianz-group/next-blog` package → follow _Upgrade_.
- **Current** — installed = latest and every item in the **Feature checklist** is satisfied → report that, change nothing, and offer optional improvements.

State the detected mode, installed → target versions, and the plan in ≤ 6 bullets before editing.

## Step 2 — Gather facts from the repo (before asking)

Infer, and only ask about what is still unknown:

- Next/React/Node versions, package manager (lockfile), `src/app` vs `app`, `@/` alias (`tsconfig.json`).
- Tailwind version and the global CSS entry file (`globals.css`).
- Existing brand tokens/CSS variables, fonts, header/footer in the root layout.
- Existing `/blog` routes or redirects that must not break (`app/blog/**`, `next.config` redirects, `sitemap.ts`, `middleware`).
- Existing blog config/ui files if upgrading (read them fully before editing).

### Questions to ask (only the unanswered ones, one batch)

1. **Content source:** Admindoor API URL (`BLOG_API_URL` — where does it live?) or a custom `getPosts()`?
2. **Identity:** site `name`, canonical `url`, `description`; logo URL (default `{url}/logo.png`); optional `legalName`, `sameAs[]`, `twitterHandle`.
3. **Image hosts** for `images.remotePatterns` (CMS/CDN hostnames).
4. **Routes:** keep `/blog`, `/blog/p/[page]`, `/blog/[slug]` or custom `routes.basePath`/`listingPath`?
5. **Listing copy:** eyebrow/title/subtitle, posts per page, locale (default `en-IN`).
6. **Optional features:** listing search? post CTA (`afterContent`)? share button (default on) — which platforms, or disabled? UTM tags on share links (`postPage.share.utm.enabled`, default off)?
7. **Branding level** (lightest that fits): **A** tokens only · **B** tokens + `cardFooter`/`ctaLabel` · **C** full `classNames` · **D** custom `renderCard`. Brand colors or existing CSS variables to reuse?
8. **Anything that must not change** (existing routes, layout chrome, fonts)?

If the user says "just make it work", default to: Admindoor + default routes + level A tokens from the host's existing accent + full SEO checklist + OG routes + share button on + no search.

## Fresh install

1. `pnpm add admindoor-blog@<exact-latest>`. Peers: `next@^16`, `react`, `react-dom`, `lucide-react`; optional `sharp` (recommended — compresses OG JPEGs).
2. Create the files below (adapt paths/alias to the host).

**`src/lib/blog-config.ts`**

```ts
import { createBlogConfig } from "admindoor-blog/next";

export const blogConfig = createBlogConfig({
  site: {
    name: "…",
    url: "https://…",
    description: "…",
    // logoUrl, legalName, sameAs, logoWidth, logoHeight, twitterHandle
  },
  content: { type: "admindoor", apiUrl: process.env.BLOG_API_URL ?? "" },
  // custom source: content: { async getPosts() { return [/* BlogPost[] */]; } },
  listing: { eyebrow: "Blog", title: "…", subtitle: "…", postsPerPage: 12 },
  locale: "en-IN",
  // search: { enabled: true },
  // routes: { basePath: "/blog", listingPath: "/blog/p" },
  postPage: {
    notFoundTitle: "Article not found",
    // afterContent: <YourCta />,
    // share: { enabled: true, platforms: ["whatsapp","x","linkedin","email"], getUrl: (post, defaultUrl) => defaultUrl },
  },
});
```

Empty `apiUrl` → empty blog; a non-OK API response fails the build loudly (intended).

**Routes** (each exports `generateStaticParams` where present, `generateMetadata`, and `default` from the factory):

```tsx
// src/app/blog/p/[page]/page.tsx
import { createBlogListingPage } from "admindoor-blog/next";
import { blogConfig } from "@/lib/blog-config";
// import { listingUi } from "@/lib/blog-ui";
const listingPage = createBlogListingPage(blogConfig /*, { ui: listingUi } */);
export const generateStaticParams = listingPage.generateStaticParams;
export const generateMetadata = listingPage.generateMetadata;
export default listingPage.default;
```

```tsx
// src/app/blog/[slug]/page.tsx
import { createBlogPostPage } from "admindoor-blog/next";
import { blogConfig } from "@/lib/blog-config";
// import { postUi } from "@/lib/blog-ui";
const postPage = createBlogPostPage(blogConfig, { homeHref: "/" /*, ui: postUi */ });
export const generateStaticParams = postPage.generateStaticParams;
export const generateMetadata = postPage.generateMetadata;
export default postPage.default;
```

```tsx
// src/app/blog/[slug]/opengraph-image.tsx  (required for WhatsApp/social embeds)
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
// src/app/blog/[slug]/twitter-image.tsx
export { alt, contentType, default, size } from "./opengraph-image";
```

**Root layout** — import styles and inject site-level JSON-LD (post/listing pages already emit Article, BreadcrumbList, FAQPage, CollectionPage):

```tsx
import "admindoor-blog/styles/blog.css";
import {
  buildOrganizationStructuredData,
  buildWebsiteStructuredData,
  serializeJsonLd,
} from "admindoor-blog/seo";
import { blogConfig } from "@/lib/blog-config";
// inside <body>:
// <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildOrganizationStructuredData(blogConfig)) }} />
// <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildWebsiteStructuredData(blogConfig)) }} />
```

**`globals.css` (Tailwind v4)** — required, or package utilities are not generated:

```css
@import "tailwindcss";
@source "../node_modules/admindoor-blog/dist"; /* adjust relative path to the CSS file */
```

(Add `.../src` too only when the package is workspace-linked, not for registry installs.)

**`next.config.ts`:**

```ts
import { getBlogRedirects } from "admindoor-blog/next/redirects";
import { blogConfig } from "./src/lib/blog-config";

export default {
  staticPageGenerationTimeout: 180, // raise (300) for large blogs; OG + sharp per post is slow
  images: { remotePatterns: [{ protocol: "https", hostname: "cdn.example.com" }] },
  async redirects() {
    return getBlogRedirects(blogConfig); // /blog -> /blog/p/1
  },
};
```

Merge into the existing config; do not overwrite it. Only `https://` images survive TipTap sanitization.

**Optional search:** `search: { enabled: true }` in config **plus** `src/app/blog/page.tsx`:

```tsx
import { createBlogSearchPage } from "admindoor-blog/next";
import { blogConfig } from "@/lib/blog-config";
const searchPage = createBlogSearchPage(blogConfig /*, { ui: listingUi } */);
export const generateMetadata = searchPage.generateMetadata;
export default searchPage.default;
```

Keep `getBlogRedirects`; bare `/blog` redirects, `/blog?q=…` is a static client search shell, results are `noindex, follow`.

**Optional sitemap** (`src/app/sitemap.ts`; merge into an existing one):

```ts
import { createBlogDataLayer } from "admindoor-blog";
import { generateBlogSitemapEntries } from "admindoor-blog/seo";
import { blogConfig } from "@/lib/blog-config";

export default async function sitemap() {
  const { getAllPosts } = createBlogDataLayer(blogConfig);
  const posts = await getAllPosts();
  return generateBlogSitemapEntries(blogConfig, posts).map((e) => ({
    url: e.url,
    ...(e.lastModified ? { lastModified: e.lastModified } : {}),
  }));
}
```

**Env:** add `BLOG_API_URL` to `.env.example` with a placeholder value, never the real URL if it carries a key.

## Upgrade

**From `@radianz-group/next-blog` (0.x, GitHub Packages):** the package was renamed to `admindoor-blog` and moved to the public npm registry at 1.0.0. The API is unchanged from 0.8.0.

1. `pnpm remove @radianz-group/next-blog && pnpm add admindoor-blog@<exact-latest>`.
2. Replace every `@radianz-group/next-blog` import, `transpilePackages` entry, CSS `@import` and Tailwind `@source` path with `admindoor-blog`.
3. Delete the `@radianz-group:registry=…` line from the project `.npmrc` (delete the file if nothing else is left), and remove the `NPM_RC` env var from Vercel if it was only there for this package.
4. If the host was on a version before 0.8.0: remove `analytics.gtagId` from the config and the `trackGtag` / `itemId` props from any custom `BlogPostShare` usage. To keep UTM-tagged share links, set `postPage.share.utm.enabled: true`.

Then, for any upgrade:

1. Install the new version first, then read `node_modules/admindoor-blog/CHANGELOG.md` for every version you are crossing (breaking changes and migration steps are listed there) and `node_modules/admindoor-blog/README.md` for current usage.
2. Re-run the **Feature checklist**; fix each gap with the smallest edit. Preserve the host's existing config values, `ui` overrides, and brand CSS.
3. Run the typecheck/build; fix type errors caused by renamed/removed options by reading the new `.d.ts`, not by guessing.
4. Do not reformat or reorganize files you did not need to touch.

## Feature checklist (use for Upgrade and Current)

- [ ] Uses `admindoor-blog` (no `@radianz-group/next-blog` imports or `.npmrc` registry lines left).
- [ ] Package pinned to an exact version; peers satisfied (Next ≥ 16, Tailwind v4, `lucide-react`; `sharp` recommended).
- [ ] `blogConfig` via `createBlogConfig` (import from `admindoor-blog/next`); full `site` fields filled.
- [ ] Listing, post, and `opengraph-image` routes use the factories (+ `twitter-image` re-export).
- [ ] Root layout imports `blog.css` and injects Organization + WebSite JSON-LD.
- [ ] Tailwind v4 `@source` points at the package `dist`.
- [ ] `next.config`: `getBlogRedirects`, `staticPageGenerationTimeout`, `images.remotePatterns`.
- [ ] Search (if wanted): `search.enabled` **and** `app/blog/page.tsx` with `createBlogSearchPage`.
- [ ] **Share button** on the post page: on by default, configured only through `postPage.share` (see _Share button_ below).
- [ ] Branding via `--blog-*` tokens scoped to `.blog-root`; no colors in `createBlogConfig`.

## Share button (post page)

A "Share" button sits in the author/date row and opens a dialog with WhatsApp, X, Facebook, LinkedIn, Telegram, Reddit, Email, a copy-link field, and a native "More" button where the browser supports it. It is **on by default** and needs **no host code**. Dependencies (`@radix-ui/react-dialog`) ship with the package; its CSS lives in `blog.css`, and it relies on Tailwind v4 container queries (covered by the `@source` entry).

Config (`blogConfig.postPage.share`):

| Option                     | Meaning                                                                                                                                        |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`                  | `false` hides the button. Default on.                                                                                                          |
| `platforms`                | Subset/order of `whatsapp`, `x`, `facebook`, `linkedin`, `telegram`, `reddit`, `email`.                                                        |
| `getUrl(post, defaultUrl)` | Server-side override of the shared URL. `defaultUrl` = `site.url` + post path. Empty return falls back to the default.                         |
| `utm`                      | UTM tagging: `enabled`, `medium`, `campaign`, `term`, `content` (string or `(post) => string`), `sources` / `mediums` (per-channel overrides). |

**UTM tags:** off by default; `postPage.share.utm: { enabled: true }` turns them on (`utm_source` = platform, `copy_link`, or `native_share`; `utm_medium` = `social`/`email`; `utm_campaign` = `blog_share`; `utm_content` = post slug).

The shared URL comes from config (`site.url` + `routes.basePath` + slug), **not** from the browser address bar — so a wrong `site.url` means wrong share links on every environment. Use `getUrl` for UTM tags or custom URL structures, e.g. ``getUrl: (post, url) => `${url}?utm_source=share` `` (runs at render on the server; no `window`).

Styling overrides go through `ui.classNames` on the post page (`createBlogPostPage(..., { ui })`), merged last so they win:

- Row: `meta`, `byline`, `avatar`, `authorName`, `date`
- Button: `share.trigger`, `share.triggerIcon`, `share.triggerLabel`
- Dialog: `share.overlay`, `share.content`, `share.header`, `share.title`, `share.description`, `share.list`, `share.item`, `share.itemLabel`, `share.copyRow`, `share.input`, `share.copyButton`

Example (square icon-only trigger, brand copy button):

```ts
export const postUi: BlogPostUi = {
  classNames: {
    share: {
      trigger: "rounded-md",
      triggerLabel: "sr-only",
      copyButton: "bg-(--blog-accent)",
    },
  },
};
```

The author/date/share row adapts to its own container width (stacked name/date on narrow, icon-only button on very narrow) — do not add viewport breakpoints to fight it.

## Theming

Chrome is driven by `--blog-*` variables on `:root`/`.blog-root` (accent, surface, border, radius, fg/muted, button). Override them in host CSS scoped to `.blog-root` / `[data-blog-root]`. The TipTap body (`.blog-content`) is **not** wired to chrome tokens — override it separately and sparingly. No Shadow DOM: broad host rules on `a`, `h1`–`h3`, `p`, `img` can leak into the blog, so scope them. Pass `ui` (`BlogListingUi` / `BlogPostUi` from `admindoor-blog/components`) into the factories only when tokens are not enough.

## Do / don't

**Do:** use factories; keep config free of styling; scope CSS; keep OG routes; fill `site` fully; preserve existing host values on upgrade.
**Don't:** fork package components; put colors in `createBlogConfig`; expect tokens to restyle TipTap; use a Tailwind v3 setup; reformat unrelated files.

## Verify checklist (run what you can, report the rest)

1. `pnpm install` succeeds with the pinned version.
2. Typecheck and `pnpm build` pass (watch static-generation timeouts; raise `staticPageGenerationTimeout` if needed).
3. Dev server: `/blog` → `/blog/p/1`; a post page renders; the **Share** button opens the dialog and links point at `site.url`-based URLs; `/blog/{slug}/opengraph-image` returns an image.
4. If search enabled: `/blog?q=…` returns results.
5. Check the post page at ~320px, ~480px and desktop widths (byline/share row stays on one line).
6. View source: Organization + WebSite JSON-LD in the layout, Article JSON-LD on a post.
7. List env vars to set (`BLOG_API_URL`) and anything you could not verify.

## Final report format

Mode + versions (installed → target) · files added/changed · config/env the user must set · what you verified vs. could not · optional follow-ups (search, sitemap, theming level up). Keep it short.
