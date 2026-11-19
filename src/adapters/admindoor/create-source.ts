import type { BlogContentSource } from "../../core/types";
import type { AdmindoorContentResponse } from "./api-types";
import { normalizeAdmindoorPost, sortPostsByDate } from "./normalize";

export function createAdmindoorSource(apiUrl: string): BlogContentSource {
  return {
    async getPosts() {
      const trimmedUrl = apiUrl.trim();

      if (!trimmedUrl) {
        return [];
      }

      const response = await fetch(trimmedUrl, { cache: "no-store" });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch blog posts: ${response.status} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as AdmindoorContentResponse;
      const items = Array.isArray(data.blogs) ? data.blogs : [];

      const posts = items
        .map((item) => normalizeAdmindoorPost(item))
        .filter((post): post is NonNullable<typeof post> => post !== null);

      return sortPostsByDate(posts);
    },
  };
}
