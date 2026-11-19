/**
 * Local SEO compliance checks for listing + post pages.
 * Mirrors Google Rich Results required fields and Facebook/LinkedIn OG expectations.
 * Run: node scripts/seo-compliance-check.mjs
 */
import { writeFileSync } from "node:fs";

const BASE = process.env.SEO_BASE_URL ?? "http://localhost:3010";

const PAGES = [
  { id: "listing-p1", path: "/blog/p/1", kind: "listing" },
  { id: "listing-p2", path: "/blog/p/2", kind: "listing" },
  {
    id: "post-with-faqs",
    path: "/blog/structured-finance-outlook-2025",
    kind: "post",
  },
  {
    id: "post-no-image",
    path: "/blog/working-capital-before-fundraise",
    kind: "post",
  },
];

function pass(label) {
  return { ok: true, label };
}
function fail(label, detail) {
  return { ok: false, label, detail };
}
function warn(label, detail) {
  return { ok: true, warn: true, label, detail };
}

function extractJsonLd(html) {
  const scripts = [];
  const re =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      scripts.push(JSON.parse(m[1].replace(/\\u003c/g, "<")));
    } catch (err) {
      scripts.push({ __parseError: String(err), raw: m[1].slice(0, 200) });
    }
  }
  return scripts;
}

function metaContent(html, prop, attr = "property") {
  const re = new RegExp(
    `<meta[^>]*${attr}=["']${prop}["'][^>]*content=["']([^"']*)["'][^>]*>|<meta[^>]*content=["']([^"']*)["'][^>]*${attr}=["']${prop}["'][^>]*>`,
    "i",
  );
  const m = html.match(re);
  return m ? m[1] || m[2] : undefined;
}

function linkHref(html, rel) {
  const re = new RegExp(
    `<link[^>]*rel=["']${rel}["'][^>]*href=["']([^"']*)["'][^>]*>|<link[^>]*href=["']([^"']*)["'][^>]*rel=["']${rel}["'][^>]*>`,
    "i",
  );
  const m = html.match(re);
  return m ? m[1] || m[2] : undefined;
}

function findByType(schemas, type) {
  return schemas.filter((s) => {
    if (!s || s.__parseError) return false;
    const t = s["@type"];
    return t === type || (Array.isArray(t) && t.includes(type));
  });
}

function checkOrganization(schema) {
  const checks = [];
  if (!schema) return [fail("Organization present", "missing")];
  checks.push(
    schema["@id"]?.includes("#organization")
      ? pass("Organization @id")
      : fail("Organization @id", schema["@id"]),
  );
  checks.push(schema.name ? pass("Organization.name") : fail("Organization.name"));
  checks.push(schema.url ? pass("Organization.url") : fail("Organization.url"));
  const logo = schema.logo;
  checks.push(
    logo?.url || typeof logo === "string"
      ? pass("Organization.logo")
      : fail("Organization.logo"),
  );
  if (logo && typeof logo === "object") {
    checks.push(
      logo.width && logo.height
        ? pass("Organization.logo width/height")
        : warn("Organization.logo width/height", "recommended for Google"),
    );
  }
  if (schema.sameAs?.length)
    checks.push(pass(`Organization.sameAs (${schema.sameAs.length})`));
  return checks;
}

function checkWebsite(schema) {
  const checks = [];
  if (!schema) return [fail("WebSite present", "missing")];
  checks.push(
    schema["@id"]?.includes("#website")
      ? pass("WebSite @id")
      : fail("WebSite @id", schema["@id"]),
  );
  checks.push(schema.name ? pass("WebSite.name") : fail("WebSite.name"));
  checks.push(schema.url ? pass("WebSite.url") : fail("WebSite.url"));
  const pubId = schema.publisher?.["@id"];
  checks.push(
    pubId?.includes("#organization")
      ? pass("WebSite.publisher @id → Organization")
      : fail("WebSite.publisher @id → Organization", pubId),
  );
  return checks;
}

function checkArticle(schema) {
  const checks = [];
  if (!schema) return [fail("Article/BlogPosting present", "missing")];
  const type = schema["@type"];
  checks.push(
    type === "Article" || type === "BlogPosting"
      ? pass(`@type ${type}`)
      : fail("@type Article|BlogPosting", type),
  );
  // Google Article rich result required
  checks.push(schema.headline ? pass("headline") : fail("headline (required)"));
  checks.push(
    schema.image && (Array.isArray(schema.image) ? schema.image.length : true)
      ? pass("image")
      : fail("image (required for Article rich results)"),
  );
  checks.push(
    schema.datePublished ? pass("datePublished") : fail("datePublished (required)"),
  );
  checks.push(
    schema.dateModified ? pass("dateModified") : warn("dateModified", "recommended"),
  );
  checks.push(
    schema.author?.name || schema.author?.[0]?.name
      ? pass("author.name")
      : warn("author.name", "recommended / often required for rich results"),
  );
  const pub = schema.publisher;
  checks.push(pub?.name ? pass("publisher.name") : fail("publisher.name"));
  checks.push(
    pub?.logo?.url || typeof pub?.logo === "string"
      ? pass("publisher.logo")
      : fail("publisher.logo (required)"),
  );
  checks.push(
    pub?.["@id"]?.includes("#organization")
      ? pass("publisher @id → Organization")
      : warn("publisher @id", pub?.["@id"]),
  );
  return checks;
}

function checkBreadcrumb(schema) {
  const checks = [];
  if (!schema) return [fail("BreadcrumbList present", "missing")];
  const items = schema.itemListElement;
  checks.push(
    Array.isArray(items) && items.length >= 2
      ? pass(`BreadcrumbList items (${items.length})`)
      : fail("BreadcrumbList items", "need ≥2"),
  );
  if (Array.isArray(items)) {
    items.forEach((item, i) => {
      const ok =
        item["@type"] === "ListItem" && item.position && item.name && item.item;
      checks.push(
        ok ? pass(`ListItem[${i}]`) : fail(`ListItem[${i}]`, JSON.stringify(item)),
      );
    });
  }
  return checks;
}

function checkFaq(schema, html) {
  const checks = [];
  if (!schema) return [fail("FAQPage present", "missing on FAQ post")];
  const entities = schema.mainEntity;
  checks.push(
    Array.isArray(entities) && entities.length
      ? pass(`FAQPage questions (${entities.length})`)
      : fail("FAQPage.mainEntity"),
  );
  if (Array.isArray(entities)) {
    for (const q of entities) {
      const ok =
        q["@type"] === "Question" &&
        q.name &&
        q.acceptedAnswer?.["@type"] === "Answer" &&
        q.acceptedAnswer?.text;
      checks.push(
        ok
          ? pass(`Q: ${q.name.slice(0, 48)}…`)
          : fail("FAQ Question incomplete", q.name),
      );
      if (q.acceptedAnswer?.text) {
        const snippet = q.acceptedAnswer.text.slice(0, 40);
        checks.push(
          html.includes(q.acceptedAnswer.text) || html.includes(snippet)
            ? pass(`FAQ answer in HTML: ${snippet}…`)
            : fail("FAQ answer missing from HTML (SSG)", snippet),
        );
      }
    }
  }
  return checks;
}

function checkCollectionPage(schema) {
  const checks = [];
  if (!schema) return [fail("CollectionPage present", "missing")];
  checks.push(schema.name ? pass("CollectionPage.name") : fail("CollectionPage.name"));
  checks.push(schema.url ? pass("CollectionPage.url") : fail("CollectionPage.url"));
  checks.push(
    schema.isPartOf?.["@id"]?.includes("#website")
      ? pass("isPartOf → WebSite @id")
      : fail("isPartOf → WebSite @id", schema.isPartOf?.["@id"]),
  );
  checks.push(
    schema.isPartOf?.publisher?.["@id"]?.includes("#organization")
      ? pass("isPartOf.publisher → Organization")
      : warn("isPartOf.publisher", schema.isPartOf?.publisher),
  );
  const list = schema.mainEntity;
  checks.push(
    list?.["@type"] === "ItemList" && Array.isArray(list.itemListElement)
      ? pass(`ItemList (${list.itemListElement.length} posts)`)
      : fail("mainEntity ItemList"),
  );
  return checks;
}

function checkOpenGraph(html, kind) {
  const checks = [];
  const title = metaContent(html, "og:title");
  const type = metaContent(html, "og:type");
  const url = metaContent(html, "og:url");
  const image = metaContent(html, "og:image");
  const desc = metaContent(html, "og:description");
  const siteName = metaContent(html, "og:site_name");
  const imageW = metaContent(html, "og:image:width");
  const imageH = metaContent(html, "og:image:height");
  const imageAlt = metaContent(html, "og:image:alt");
  const twCard = metaContent(html, "twitter:card", "name");
  const twTitle = metaContent(html, "twitter:title", "name");
  const twImage = metaContent(html, "twitter:image", "name");
  const twSite = metaContent(html, "twitter:site", "name");
  const canonical = linkHref(html, "canonical");

  // Facebook OG required
  checks.push(
    title ? pass(`og:title = ${title.slice(0, 60)}`) : fail("og:title (required)"),
  );
  checks.push(type ? pass(`og:type = ${type}`) : fail("og:type (required)"));
  checks.push(
    type === (kind === "post" ? "article" : "website")
      ? pass("og:type matches page kind")
      : warn("og:type vs page kind", `got ${type}, kind ${kind}`),
  );
  checks.push(url ? pass(`og:url = ${url}`) : fail("og:url (required)"));
  checks.push(image ? pass(`og:image = ${image}`) : fail("og:image (required)"));
  checks.push(desc ? pass("og:description") : warn("og:description", "recommended"));
  checks.push(siteName ? pass(`og:site_name = ${siteName}`) : warn("og:site_name"));

  if (image) {
    const absolute = /^https?:\/\//i.test(image);
    checks.push(
      absolute
        ? pass("og:image is absolute URL")
        : fail("og:image must be absolute for most validators", image),
    );
    if (kind === "post") {
      checks.push(
        image.includes("opengraph-image")
          ? pass("og:image uses opengraph-image route")
          : warn("og:image route", image),
      );
    }
  }

  if (imageW && imageH) {
    checks.push(pass(`og:image size ${imageW}x${imageH}`));
    if (kind === "post") {
      checks.push(
        imageW === "1200" && imageH === "630"
          ? pass("post OG size is 1200x630")
          : warn("post OG size", `${imageW}x${imageH}`),
      );
    }
  } else {
    checks.push(
      kind === "post"
        ? fail("og:image:width/height", "required for reliable OG validation on posts")
        : warn("og:image:width/height", "recommended"),
    );
  }

  if (imageAlt) checks.push(pass("og:image:alt"));

  // Article-specific
  if (kind === "post") {
    const published = metaContent(html, "article:published_time");
    checks.push(
      published ? pass("article:published_time") : warn("article:published_time"),
    );
  }

  // Twitter
  checks.push(twCard ? pass(`twitter:card = ${twCard}`) : fail("twitter:card"));
  if (kind === "post") {
    checks.push(
      twCard === "summary_large_image"
        ? pass("twitter:card is summary_large_image")
        : fail("twitter:card should be summary_large_image on posts", twCard),
    );
  }
  checks.push(twTitle ? pass("twitter:title") : warn("twitter:title"));
  checks.push(twImage ? pass("twitter:image") : fail("twitter:image"));
  checks.push(
    twSite
      ? pass(`twitter:site = ${twSite}`)
      : warn("twitter:site", "set when handle configured"),
  );

  checks.push(canonical ? pass(`canonical = ${canonical}`) : fail("rel=canonical"));

  return checks;
}

function summarize(checks) {
  const failed = checks.filter((c) => !c.ok);
  const warnings = checks.filter((c) => c.ok && c.warn);
  const passed = checks.filter((c) => c.ok && !c.warn);
  return { passed, warnings, failed, ok: failed.length === 0 };
}

async function fetchHtml(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.text();
}

async function main() {
  const report = [];

  for (const page of PAGES) {
    const html = await fetchHtml(page.path);
    const schemas = extractJsonLd(html);
    const parseErrors = schemas.filter((s) => s.__parseError);
    const checks = [];

    if (parseErrors.length) {
      checks.push(
        fail("JSON-LD parse", parseErrors.map((e) => e.__parseError).join("; ")),
      );
    } else {
      checks.push(pass(`JSON-LD scripts parsed (${schemas.length})`));
    }

    const types = schemas.map((s) => s["@type"]).filter(Boolean);
    checks.push(pass(`schema @types: ${types.join(", ") || "(none)"}`));

    if (page.kind === "listing") {
      // Root layout schemas + listing CollectionPage
      checks.push(...checkOrganization(findByType(schemas, "Organization")[0]));
      checks.push(...checkWebsite(findByType(schemas, "WebSite")[0]));
      checks.push(...checkCollectionPage(findByType(schemas, "CollectionPage")[0]));
    } else {
      checks.push(...checkOrganization(findByType(schemas, "Organization")[0]));
      checks.push(...checkWebsite(findByType(schemas, "WebSite")[0]));
      const article =
        findByType(schemas, "BlogPosting")[0] || findByType(schemas, "Article")[0];
      checks.push(...checkArticle(article));
      checks.push(...checkBreadcrumb(findByType(schemas, "BreadcrumbList")[0]));
      if (page.id === "post-with-faqs") {
        checks.push(...checkFaq(findByType(schemas, "FAQPage")[0], html));
      } else {
        const faq = findByType(schemas, "FAQPage")[0];
        if (faq) checks.push(...checkFaq(faq, html));
      }
    }

    checks.push(...checkOpenGraph(html, page.kind));

    // Probe OG image HTTP status for same-origin OG routes; external logos are config-dependent.
    const ogImage = metaContent(html, "og:image");
    if (ogImage) {
      try {
        const parsed = new URL(ogImage, BASE);
        const isOgRoute = parsed.pathname.includes("/opengraph-image");
        const isDemoHost = parsed.hostname === "demo.example.com";

        if (isOgRoute) {
          const imageUrl = new URL(parsed.pathname + parsed.search, BASE).toString();
          const imgRes = await fetch(imageUrl, { method: "GET" });
          const ct = imgRes.headers.get("content-type") ?? "";
          checks.push(
            imgRes.ok && ct.startsWith("image/")
              ? pass(`og:image route fetchable (${imgRes.status}, ${ct})`)
              : fail("og:image route fetch", `${imgRes.status} ${ct} ${imageUrl}`),
          );
        } else if (isDemoHost) {
          checks.push(
            warn(
              "og:image logo URL",
              "demo.example.com is a placeholder — production logoUrl must be a real HTTPS image",
            ),
          );
        } else {
          const imgRes = await fetch(ogImage, { method: "GET", redirect: "follow" });
          const ct = imgRes.headers.get("content-type") ?? "";
          checks.push(
            imgRes.ok && ct.startsWith("image/")
              ? pass(`og:image logo fetchable (${imgRes.status}, ${ct})`)
              : fail("og:image logo fetch", `${imgRes.status} ${ct} ${ogImage}`),
          );
        }
      } catch (err) {
        checks.push(fail("og:image fetch error", String(err)));
      }
    }

    const summary = summarize(checks);
    report.push({
      page: page.id,
      path: page.path,
      url: `${BASE}${page.path}`,
      schemaTypes: types,
      ...summary,
      checks,
    });
  }

  // Pretty print
  const line = (s = "") => {
    console.log(s);
  };

  line(`SEO compliance check @ ${BASE}`);
  line("=".repeat(72));

  let allOk = true;
  for (const r of report) {
    const status = r.ok ? "PASS" : "FAIL";
    if (!r.ok) allOk = false;
    line(`\n[${status}] ${r.page}  ${r.path}`);
    line(`  schemas: ${r.schemaTypes.join(" | ") || "(none)"}`);
    line(`  ✓ ${r.passed.length}  ⚠ ${r.warnings.length}  ✗ ${r.failed.length}`);
    for (const c of r.failed) {
      line(`  ✗ ${c.label}${c.detail ? ` — ${c.detail}` : ""}`);
    }
    for (const c of r.warnings) {
      line(`  ⚠ ${c.label}${c.detail ? ` — ${c.detail}` : ""}`);
    }
  }

  line("\n" + "=".repeat(72));
  line(allOk ? "OVERALL: PASS (no hard failures)" : "OVERALL: FAIL (see ✗ above)");
  line("Note: Google Rich Results Test / Facebook Sharing Debugger need a public URL.");
  line(
    "Local checks mirror their required fields. FAQ rich results are limited by Google policy for many sites.",
  );

  writeFileSync(
    new URL("./seo-compliance-report.json", import.meta.url),
    JSON.stringify(report, null, 2),
  );
  line("Wrote scripts/seo-compliance-report.json");

  process.exit(allOk ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
