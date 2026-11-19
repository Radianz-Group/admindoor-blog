import { ImageResponse } from "next/og";

import type { BlogConfig } from "../core/config-schema";
import { getSharedBlogDataLayer } from "../core/create-data-layer";
import { getBlogPostFeaturedImage, getBlogPostSeoTitle } from "../seo/helpers";

export const BLOG_OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const;

export const BLOG_OG_IMAGE_CONTENT_TYPE = "image/jpeg";

interface OpengraphImageParams {
  params: Promise<{
    slug: string;
  }>;
}

async function optimizeCoverImage(input: Buffer): Promise<Buffer | null> {
  try {
    const sharpModule = await import("sharp");
    const sharp = sharpModule.default;
    return await sharp(input)
      .rotate()
      .resize(BLOG_OG_IMAGE_SIZE.width, BLOG_OG_IMAGE_SIZE.height, {
        fit: "cover",
        position: "centre",
      })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();
  } catch {
    return null;
  }
}

function buildFallbackCard(config: BlogConfig, title: string): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: 64,
        background: "linear-gradient(145deg, #0f172a 0%, #1e293b 55%, #334155 100%)",
        color: "#f8fafc",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ fontSize: 28, opacity: 0.75, marginBottom: 16 }}>
        {config.site.name}
      </div>
      <div
        style={{
          fontSize: 56,
          fontWeight: 700,
          lineHeight: 1.15,
          maxWidth: 1000,
        }}
      >
        {title}
      </div>
    </div>,
    {
      ...BLOG_OG_IMAGE_SIZE,
    },
  );
}

/**
 * Factory for App Router `opengraph-image.tsx` / `twitter-image.tsx`.
 * Serves the post cover as a 1200×630 JPEG so WhatsApp and similar
 * crawlers accept the embed image (large CDN PNGs are often dropped).
 */
export function createBlogPostOpengraphImage(config: BlogConfig) {
  const dataLayer = getSharedBlogDataLayer(config);

  return async function BlogPostOpengraphImage({
    params,
  }: OpengraphImageParams): Promise<Response> {
    const { slug } = await params;
    const post = await dataLayer.getPostBySlug(slug);
    const title = post ? getBlogPostSeoTitle(post) : config.site.name;
    const coverUrl = post ? getBlogPostFeaturedImage(post) : undefined;

    if (!coverUrl) {
      return buildFallbackCard(config, title || config.site.name);
    }

    try {
      const upstream = await fetch(coverUrl, {
        next: { revalidate: 86_400 },
      });

      if (!upstream.ok) {
        return buildFallbackCard(config, title || config.site.name);
      }

      const input = Buffer.from(await upstream.arrayBuffer());
      const optimized = await optimizeCoverImage(input);
      const body = new Uint8Array(optimized ?? input);
      const contentType = optimized
        ? BLOG_OG_IMAGE_CONTENT_TYPE
        : (upstream.headers.get("content-type") ?? "image/png");

      return new Response(body, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, immutable, no-transform, max-age=31536000",
        },
      });
    } catch {
      return buildFallbackCard(config, title || config.site.name);
    }
  };
}
