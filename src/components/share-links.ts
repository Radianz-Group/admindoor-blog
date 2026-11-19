export type SharePlatform =
  "whatsapp" | "x" | "facebook" | "linkedin" | "telegram" | "reddit" | "email";

export const DEFAULT_SHARE_PLATFORMS: SharePlatform[] = [
  "whatsapp",
  "x",
  "facebook",
  "linkedin",
  "telegram",
  "reddit",
  "email",
];

export const SHARE_PLATFORM_LABELS: Record<SharePlatform, string> = {
  whatsapp: "WhatsApp",
  x: "X",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  telegram: "Telegram",
  reddit: "Reddit",
  email: "Email",
};

export function buildShareHref(
  platform: SharePlatform,
  { url, title }: { url: string; title: string },
): string {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  switch (platform) {
    case "whatsapp":
      return `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
    case "x":
      return `https://twitter.com/intent/tweet?url=${u}&text=${t}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
    case "telegram":
      return `https://t.me/share/url?url=${u}&text=${t}`;
    case "reddit":
      return `https://www.reddit.com/submit?url=${u}&title=${t}`;
    case "email":
      return `mailto:?subject=${t}&body=${encodeURIComponent(`${title}\n${url}`)}`;
  }
}

/** Where a share originated: a platform link, the copy field, or the native share sheet. */
export type ShareChannel = SharePlatform | "copy" | "native";

export interface ShareUtm {
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
  sources?: Partial<Record<ShareChannel, string>>;
  mediums?: Partial<Record<ShareChannel, string>>;
}

const DEFAULT_UTM_SOURCES: Partial<Record<ShareChannel, string>> = {
  copy: "copy_link",
  native: "native_share",
};

/**
 * Adds utm_* parameters for a share channel. Existing utm_* params on the URL
 * are never overwritten; an unparsable URL is returned unchanged.
 */
export function appendUtm(
  url: string,
  utm: ShareUtm | undefined,
  channel: ShareChannel,
): string {
  if (!utm) return url;
  try {
    const target = new URL(url);
    const params: Record<string, string | undefined> = {
      utm_source: utm.sources?.[channel] ?? DEFAULT_UTM_SOURCES[channel] ?? channel,
      utm_medium:
        utm.mediums?.[channel] ??
        (channel === "email" ? "email" : (utm.medium ?? "social")),
      utm_campaign: utm.campaign ?? "blog_share",
      utm_content: utm.content,
      utm_term: utm.term,
    };
    for (const [key, value] of Object.entries(params)) {
      if (value && !target.searchParams.has(key)) target.searchParams.set(key, value);
    }
    return target.toString();
  } catch {
    return url;
  }
}
