import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "admindoor-blog example",
  description: "Minimal Next.js app demonstrating the admindoor-blog package.",
};

const demoLinks = [
  {
    href: "/blog/structured-finance-outlook-2025",
    label: "Full-featured post",
    detail:
      "TLDR, boxed Key Takeaways & FAQs (h2), table, BlogPosting JSON-LD, breadcrumbs; related cards use a long category badge (CSS ellipsis)",
  },
  {
    href: "/blog/working-capital-before-fundraise",
    label: "No-image card",
    detail: "Short category badge sized to the label text (not full card width)",
  },
  {
    href: "/blog/regulatory-roundup-q3-2024",
    label: "No-author post",
    detail: "Compact category badge with image and no author byline",
  },
  {
    href: "/blog/p/1",
    label: "Listing page 1",
    detail:
      "CollectionPage JSON-LD, article grid: long category ellipsis + short fit-content badges, pagination",
  },
  {
    href: "/blog/p/2",
    label: "Listing page 2",
    detail: "rel prev/next metadata; M&A badge stays compact on a single line",
  },
] as const;

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-10 px-6 py-16">
      <div className="space-y-3">
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Example app
        </p>
        <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
          admindoor-blog demo site
        </h1>
      </div>

      <Link
        href="/blog/p/1"
        className="inline-flex w-fit rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
      >
        View blog
      </Link>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">Quick links</h2>
        <ul className="divide-y divide-slate-200 rounded-md border border-slate-200 bg-white">
          {demoLinks.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex flex-col gap-0.5 px-4 py-3 hover:bg-slate-50"
              >
                <span className="text-sm font-medium text-slate-900">{item.label}</span>
                <span className="text-xs text-slate-500">{item.detail}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
