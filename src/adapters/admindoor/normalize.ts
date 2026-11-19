import { tiptapJsonToSanitizedHtml } from "../../content/tiptap-content";
import type { BlogPost, BlogPostFaq, BlogPostSeo } from "../../core/types";
import type { AdmindoorBlogPost, AdmindoorBlogSeo } from "./api-types";

export function sortPostsByDate(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

function normalizeSeoFaqs(faqs: AdmindoorBlogSeo["faqs"]): BlogPostFaq[] | undefined {
  if (!Array.isArray(faqs)) {
    return undefined;
  }

  const normalized = faqs
    .map((faq) => {
      const question = typeof faq.question === "string" ? faq.question.trim() : "";
      const answer = typeof faq.answer === "string" ? faq.answer.trim() : "";

      if (!question || !answer) {
        return null;
      }

      return { question, answer };
    })
    .filter((faq): faq is BlogPostFaq => faq !== null);

  return normalized.length > 0 ? normalized : undefined;
}

export function normalizeSeo(
  rawSeo: AdmindoorBlogSeo | undefined,
): BlogPostSeo | undefined {
  if (!rawSeo) {
    return undefined;
  }

  const title = typeof rawSeo.title === "string" ? rawSeo.title.trim() : undefined;
  const description =
    typeof rawSeo.description === "string" ? rawSeo.description.trim() : undefined;
  const primaryTopic =
    typeof rawSeo.primaryTopic === "string" ? rawSeo.primaryTopic.trim() : undefined;
  const targetQuery =
    typeof rawSeo.targetQuery === "string" ? rawSeo.targetQuery.trim() : undefined;
  const summary =
    typeof rawSeo.summary === "string" ? rawSeo.summary.trim() : undefined;
  const featuredImage =
    typeof rawSeo.featuredImage === "string" &&
    rawSeo.featuredImage.startsWith("https://")
      ? rawSeo.featuredImage
      : undefined;
  const schemaType =
    typeof rawSeo.schemaType === "string" ? rawSeo.schemaType.trim() : undefined;
  const tags = Array.isArray(rawSeo.tags)
    ? rawSeo.tags
        .filter((tag): tag is string => typeof tag === "string")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : undefined;
  const keyTakeaways = Array.isArray(rawSeo.keyTakeaways)
    ? rawSeo.keyTakeaways
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : undefined;
  const faqs = normalizeSeoFaqs(rawSeo.faqs);
  const robotsIndex =
    typeof rawSeo.robotsIndex === "boolean" ? rawSeo.robotsIndex : undefined;

  if (
    !title &&
    !description &&
    !primaryTopic &&
    !targetQuery &&
    !summary &&
    !featuredImage &&
    !schemaType &&
    !tags?.length &&
    !keyTakeaways?.length &&
    !faqs?.length &&
    robotsIndex === undefined
  ) {
    return undefined;
  }

  return {
    title,
    description,
    primaryTopic,
    targetQuery,
    summary,
    featuredImage,
    schemaType,
    tags,
    keyTakeaways,
    faqs,
    robotsIndex,
  };
}

export function normalizeAdmindoorPost(raw: AdmindoorBlogPost): BlogPost | null {
  const slug = raw.urlSlug;
  const title = raw.title;
  const excerpt = raw.excerpt;
  const publishedAt = raw.publishedAt ?? raw.createdAt;

  if (!slug || !title || !excerpt || !publishedAt) {
    return null;
  }

  const content = tiptapJsonToSanitizedHtml(raw.content);
  const seo = normalizeSeo(raw.seo);
  const imageUrl = seo?.featuredImage;
  const authorImage =
    typeof raw.author?.image === "string" && raw.author.image.startsWith("https://")
      ? raw.author.image
      : undefined;
  const updatedAt =
    typeof raw.updatedAt === "string" && raw.updatedAt !== publishedAt
      ? raw.updatedAt
      : undefined;

  return {
    slug,
    title,
    excerpt: excerpt.trim(),
    content,
    publishedAt,
    updatedAt,
    imageUrl,
    author: typeof raw.author?.name === "string" ? raw.author.name : undefined,
    authorImage,
    authorAbout:
      typeof raw.author?.about === "string" ? raw.author.about.trim() : undefined,
    seo,
  };
}
