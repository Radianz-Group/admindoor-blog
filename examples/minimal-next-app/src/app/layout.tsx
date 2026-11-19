import type { Metadata } from "next";

import "admindoor-blog/styles/blog.css";
import {
  buildOrganizationStructuredData,
  buildWebsiteStructuredData,
  serializeJsonLd,
} from "admindoor-blog/seo";

import { blogConfig } from "../lib/blog-config";
import "./globals.css";

const organizationSchema = buildOrganizationStructuredData(blogConfig);
const websiteSchema = buildWebsiteStructuredData(blogConfig);

export const metadata: Metadata = {
  metadataBase: new URL(blogConfig.site.url),
  title: {
    default: blogConfig.site.name,
    template: `%s - ${blogConfig.site.name}`,
  },
  description: blogConfig.site.description ?? blogConfig.listing?.subtitle,
  openGraph: {
    siteName: blogConfig.site.name,
    type: "website",
    ...(blogConfig.site.logoUrl
      ? {
          images: [
            {
              url: blogConfig.site.logoUrl,
              alt: `${blogConfig.site.name} logo`,
              ...(blogConfig.site.logoWidth
                ? { width: blogConfig.site.logoWidth }
                : {}),
              ...(blogConfig.site.logoHeight
                ? { height: blogConfig.site.logoHeight }
                : {}),
            },
          ],
        }
      : {}),
  },
  ...(blogConfig.site.twitterHandle
    ? {
        twitter: {
          site: blogConfig.site.twitterHandle.startsWith("@")
            ? blogConfig.site.twitterHandle
            : `@${blogConfig.site.twitterHandle}`,
        },
      }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={blogConfig.locale?.split("-")[0] ?? "en"}>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
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
