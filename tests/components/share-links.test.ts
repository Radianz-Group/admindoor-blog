import { describe, expect, it } from "vitest";

import {
  appendUtm,
  buildShareHref,
  DEFAULT_SHARE_PLATFORMS,
  SHARE_PLATFORM_LABELS,
  type ShareUtm,
} from "../../src/components/share-links";

const input = { url: "https://example.com/blog/a?x=1&y=2", title: "Tom & Jerry" };

describe("buildShareHref", () => {
  it("builds a link for every default platform", () => {
    for (const platform of DEFAULT_SHARE_PLATFORMS) {
      expect(buildShareHref(platform, input)).toBeTruthy();
      expect(SHARE_PLATFORM_LABELS[platform]).toBeTruthy();
    }
  });

  it("encodes url and title for X", () => {
    expect(buildShareHref("x", input)).toBe(
      "https://twitter.com/intent/tweet?url=https%3A%2F%2Fexample.com%2Fblog%2Fa%3Fx%3D1%26y%3D2&text=Tom%20%26%20Jerry",
    );
  });

  it("puts title and url together in the WhatsApp text", () => {
    expect(buildShareHref("whatsapp", input)).toBe(
      `https://wa.me/?text=${encodeURIComponent("Tom & Jerry https://example.com/blog/a?x=1&y=2")}`,
    );
  });

  it("builds Facebook, LinkedIn, Telegram and Reddit links", () => {
    const u = encodeURIComponent(input.url);
    expect(buildShareHref("facebook", input)).toBe(
      `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    );
    expect(buildShareHref("linkedin", input)).toBe(
      `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    );
    expect(buildShareHref("telegram", input)).toContain(
      `https://t.me/share/url?url=${u}`,
    );
    expect(buildShareHref("reddit", input)).toContain(
      `https://www.reddit.com/submit?url=${u}`,
    );
  });

  it("builds a mailto link with subject and body", () => {
    const href = buildShareHref("email", input);
    expect(href).toMatch(/^mailto:\?subject=Tom%20%26%20Jerry&body=/);
    expect(decodeURIComponent(href)).toContain(input.url);
  });
});

describe("appendUtm", () => {
  const url = "https://example.com/blog/hello";
  const utm: ShareUtm = { content: "hello" };

  it("returns the url unchanged when utm is undefined", () => {
    expect(appendUtm(url, undefined, "x")).toBe(url);
  });

  it("applies defaults with the channel as source", () => {
    expect(appendUtm(url, utm, "whatsapp")).toBe(
      `${url}?utm_source=whatsapp&utm_medium=social&utm_campaign=blog_share&utm_content=hello`,
    );
  });

  it("uses email medium for email and distinct sources for copy and native", () => {
    expect(appendUtm(url, utm, "email")).toContain("utm_medium=email");
    expect(appendUtm(url, utm, "copy")).toContain("utm_source=copy_link");
    expect(appendUtm(url, utm, "native")).toContain("utm_source=native_share");
  });

  it("applies custom medium, campaign, term and content", () => {
    const out = new URL(
      appendUtm(
        url,
        { medium: "referral", campaign: "spring", term: "t", content: "c" },
        "x",
      ),
    );
    expect(out.searchParams.get("utm_medium")).toBe("referral");
    expect(out.searchParams.get("utm_campaign")).toBe("spring");
    expect(out.searchParams.get("utm_term")).toBe("t");
    expect(out.searchParams.get("utm_content")).toBe("c");
  });

  it("lets per-channel sources and mediums override defaults", () => {
    const out = new URL(
      appendUtm(
        url,
        { sources: { x: "twitter" }, mediums: { x: "tweet", email: "newsletter" } },
        "x",
      ),
    );
    expect(out.searchParams.get("utm_source")).toBe("twitter");
    expect(out.searchParams.get("utm_medium")).toBe("tweet");
    expect(
      new URL(
        appendUtm(url, { mediums: { email: "newsletter" } }, "email"),
      ).searchParams.get("utm_medium"),
    ).toBe("newsletter");
  });

  it("omits utm_content and utm_term when not set", () => {
    const out = new URL(appendUtm(url, {}, "x"));
    expect(out.searchParams.has("utm_content")).toBe(false);
    expect(out.searchParams.has("utm_term")).toBe(false);
  });

  it("preserves existing query params and never overwrites existing utm_*", () => {
    const out = new URL(appendUtm(`${url}?q=1&utm_campaign=keep`, utm, "x"));
    expect(out.searchParams.get("q")).toBe("1");
    expect(out.searchParams.get("utm_campaign")).toBe("keep");
    expect(out.searchParams.get("utm_source")).toBe("x");
  });

  it("returns an unparsable url unchanged", () => {
    expect(appendUtm("/relative/path", utm, "x")).toBe("/relative/path");
  });
});
