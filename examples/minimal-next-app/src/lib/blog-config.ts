import type { AdmindoorContentResponse } from "admindoor-blog/adapters/admindoor";
import {
  normalizeAdmindoorPost,
  sortPostsByDate,
} from "admindoor-blog/adapters/admindoor";
import type { BlogContentSource } from "admindoor-blog";
import { createBlogConfig } from "admindoor-blog";

import sampleResponse from "./sample-response.json";

function createStaticBlogSource(): BlogContentSource {
  return {
    async getPosts() {
      const data = sampleResponse as AdmindoorContentResponse;
      const posts = (data.blogs ?? [])
        .map((item) => normalizeAdmindoorPost(item))
        .filter((post): post is NonNullable<typeof post> => post !== null);

      return sortPostsByDate(posts);
    },
  };
}

function resolveContentSource():
  BlogContentSource | { type: "admindoor"; apiUrl: string } {
  const apiUrl = process.env.BLOG_API_URL?.trim();

  if (apiUrl) {
    return { type: "admindoor", apiUrl };
  }

  return createStaticBlogSource();
}

export const blogConfig = createBlogConfig({
  site: {
    name: "Demo Blog",
    url: "https://demo.example.com",
    logoUrl: "https://demo.example.com/logo.png",
    description: "Sample articles and SEO demos for the admindoor-blog package.",
    legalName: "Demo Blog Inc.",
    sameAs: [
      "https://twitter.com/demoblog",
      "https://www.linkedin.com/company/demoblog",
    ],
    logoWidth: 512,
    logoHeight: 512,
    twitterHandle: "@demoblog",
  },
  content: resolveContentSource(),
  listing: {
    eyebrow: "Demo Blog",
    title: "Insights & Updates",
    subtitle:
      "Category badges size to their label; long topics ellipsize on one line with the date kept on the right.",
    postsPerPage: 3,
    emptyMessage: "No articles available yet.",
  },
  search: {
    enabled: true,
    placeholder: "Search articles…",
    emptyResultsMessage: "No articles match your search.",
    fieldWeights: {
      title: 3,
      tags: 2,
      primaryTopic: 2,
      excerpt: 1,
    },
  },
  locale: "en-IN",
  postPage: {
    notFoundTitle: "Article not found",
    share: {
      platforms: ["whatsapp", "x", "linkedin", "email"],
      // Off by default; adds utm_source/medium/campaign/content to every share link.
      utm: { enabled: true },
    },
  },
});
