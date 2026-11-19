import { describe, expect, it } from "vitest";

import {
  sanitizeBlogHtml,
  tiptapJsonToSanitizedHtml,
} from "../../src/content/tiptap-content";

describe("sanitizeBlogHtml", () => {
  it("strips scripts and data attributes", () => {
    const html =
      '<p onclick="alert(1)" data-testid="x">Safe</p><script>alert("xss")</script>';

    expect(sanitizeBlogHtml(html)).toBe("<p>Safe</p>");
  });

  it("allows only https links and images", () => {
    const html =
      '<a href="http://insecure.example">Bad link</a><a href="https://secure.example">Good link</a><img src="http://bad.example/x.jpg" /><img src="https://cdn.example/x.jpg" alt="Hero" />';
    const sanitized = sanitizeBlogHtml(html);

    expect(sanitized).toContain('href="https://secure.example"');
    expect(sanitized).not.toContain("http://insecure.example");
    expect(sanitized).not.toContain("http://bad.example");
    expect(sanitized).toContain('src="https://cdn.example/x.jpg"');
    expect(sanitized).toContain('rel="noopener noreferrer nofollow"');
    expect(sanitized).toContain('loading="lazy"');
    expect(sanitized).toContain('decoding="async"');
  });
});

describe("tiptapJsonToSanitizedHtml", () => {
  it("converts TipTap JSON to sanitized HTML", () => {
    const html = tiptapJsonToSanitizedHtml({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Hello " },
            { type: "text", marks: [{ type: "bold" }], text: "world" },
          ],
        },
      ],
    });

    expect(html).toMatchInlineSnapshot(`"<p>Hello <strong>world</strong></p>"`);
  });

  it("sanitizes raw HTML strings", () => {
    expect(tiptapJsonToSanitizedHtml("<p>Hello</p><script>alert(1)</script>")).toBe(
      "<p>Hello</p>",
    );
  });

  it("returns an empty string for invalid content", () => {
    expect(tiptapJsonToSanitizedHtml(null)).toBe("");
    expect(tiptapJsonToSanitizedHtml({ type: "paragraph" })).toBe("");
  });

  it("skips unsupported node types without throwing", () => {
    const html = tiptapJsonToSanitizedHtml({
      type: "doc",
      content: [
        { type: "customEmbed", attrs: { url: "https://evil.example/embed" } },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Still visible" }],
        },
      ],
    });

    expect(html).toBe("<p>Still visible</p>");
    expect(html).not.toContain("customEmbed");
    expect(html).not.toContain("evil.example");
  });

  it("salvages supported content nested inside unsupported nodes", () => {
    const html = tiptapJsonToSanitizedHtml({
      type: "doc",
      content: [
        {
          type: "callout",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Nested paragraph" }],
            },
          ],
        },
      ],
    });

    expect(html).toBe("<p>Nested paragraph</p>");
  });

  it("strips unsupported marks while keeping text", () => {
    const html = tiptapJsonToSanitizedHtml({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Highlighted",
              marks: [{ type: "highlight" }, { type: "bold" }],
            },
          ],
        },
      ],
    });

    expect(html).toBe("<p><strong>Highlighted</strong></p>");
  });

  it("converts TipTap table JSON to sanitized HTML", () => {
    const html = tiptapJsonToSanitizedHtml({
      type: "doc",
      content: [
        {
          type: "table",
          content: [
            {
              type: "tableRow",
              content: [
                {
                  type: "tableHeader",
                  content: [
                    { type: "paragraph", content: [{ type: "text", text: "Header" }] },
                  ],
                },
                {
                  type: "tableHeader",
                  content: [
                    { type: "paragraph", content: [{ type: "text", text: "Value" }] },
                  ],
                },
              ],
            },
            {
              type: "tableRow",
              content: [
                {
                  type: "tableCell",
                  content: [
                    { type: "paragraph", content: [{ type: "text", text: "Row 1" }] },
                  ],
                },
                {
                  type: "tableCell",
                  content: [
                    { type: "paragraph", content: [{ type: "text", text: "Data" }] },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    expect(html).toContain("<table>");
    expect(html).toContain("<tr>");
    expect(html).toMatch(/<th[\s>]/);
    expect(html).toMatch(/<td[\s>]/);
    expect(html).toContain("Header");
    expect(html).toContain("Data");
  });
});
