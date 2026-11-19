import { z } from "zod";

import type { BlogContentSource, BlogPost } from "./types";

const siteSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  logoUrl: z.string().url().optional(),
  description: z.string().optional(),
  legalName: z.string().optional(),
  sameAs: z.array(z.string().url()).optional(),
  logoWidth: z.number().int().positive().optional(),
  logoHeight: z.number().int().positive().optional(),
  twitterHandle: z.string().optional(),
});

const routesSchema = z
  .object({
    basePath: z.string().optional(),
    listingPath: z.string().optional(),
  })
  .optional();

const listingSchema = z
  .object({
    postsPerPage: z.number().int().positive().optional(),
    eyebrow: z.string().optional(),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    emptyMessage: z.string().optional(),
  })
  .optional();

const searchSchema = z
  .object({
    enabled: z.boolean().optional(),
    maxQueryLength: z.number().int().positive().optional(),
    queryParam: z.string().min(1).optional(),
    placeholder: z.string().optional(),
    emptyResultsMessage: z.string().optional(),
    fieldWeights: z
      .object({
        title: z.number().nonnegative().optional(),
        tags: z.number().nonnegative().optional(),
        primaryTopic: z.number().nonnegative().optional(),
        excerpt: z.number().nonnegative().optional(),
      })
      .optional(),
  })
  .optional();

const admindoorContentSchema = z.object({
  type: z.literal("admindoor"),
  apiUrl: z.string(),
});

const customContentSchema = z.custom<BlogContentSource>(
  (value) =>
    typeof value === "object" &&
    value !== null &&
    "getPosts" in value &&
    typeof (value as BlogContentSource).getPosts === "function",
  { message: "Invalid BlogContentSource" },
);

const contentSchema = z.union([admindoorContentSchema, customContentSchema]);

/** Resolve the URL shared for a post; receives the default (site url + post path). */
export type BlogShareUrlResolver = (post: BlogPost, defaultUrl: string) => string;

const shareUrlResolverSchema = z.custom<BlogShareUrlResolver>(
  (value) => typeof value === "function",
  { message: "postPage.share.getUrl must be a function" },
);

const shareChannelSchema = z.enum([
  "whatsapp",
  "x",
  "facebook",
  "linkedin",
  "telegram",
  "reddit",
  "email",
  "copy",
  "native",
]);

/** Resolves utm_content for a post (defaults to the post slug). */
export type BlogShareUtmContentResolver = (post: BlogPost) => string;

const shareUtmSchema = z
  .object({
    enabled: z.boolean().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional(),
    term: z.string().optional(),
    content: z
      .union([
        z.string(),
        z.custom<BlogShareUtmContentResolver>((value) => typeof value === "function", {
          message: "postPage.share.utm.content must be a string or function",
        }),
      ])
      .optional(),
    sources: z.record(shareChannelSchema, z.string()).optional(),
    mediums: z.record(shareChannelSchema, z.string()).optional(),
  })
  .optional();

const postPageSchema = z
  .object({
    notFoundTitle: z.string().optional(),
    afterContent: z.unknown().optional(),
    share: z
      .object({
        enabled: z.boolean().optional(),
        getUrl: shareUrlResolverSchema.optional(),
        utm: shareUtmSchema,
        platforms: z
          .array(
            z.enum([
              "whatsapp",
              "x",
              "facebook",
              "linkedin",
              "telegram",
              "reddit",
              "email",
            ]),
          )
          .optional(),
      })
      .optional(),
  })
  .optional();

export const blogConfigInputSchema = z.object({
  site: siteSchema,
  routes: routesSchema,
  content: contentSchema,
  listing: listingSchema,
  search: searchSchema,
  locale: z.string().optional(),
  postPage: postPageSchema,
});

export type BlogConfig = z.infer<typeof blogConfigInputSchema>;
