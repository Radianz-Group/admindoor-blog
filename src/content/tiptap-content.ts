import type { JSONContent } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import sanitizeHtml from "sanitize-html";

const tiptapExtensions = [
  StarterKit,
  Image,
  Table.configure({ resizable: false }),
  TableRow,
  TableHeader,
  TableCell,
];

const SUPPORTED_NODE_TYPES = new Set([
  "doc",
  "paragraph",
  "text",
  "heading",
  "bulletList",
  "orderedList",
  "listItem",
  "blockquote",
  "codeBlock",
  "horizontalRule",
  "hardBreak",
  "image",
  "table",
  "tableRow",
  "tableHeader",
  "tableCell",
]);

const SUPPORTED_MARK_TYPES = new Set(["bold", "italic", "strike", "code", "link"]);

const LEAF_NODE_TYPES = new Set(["horizontalRule", "hardBreak", "image"]);

function filterTiptapContentNodes(nodes: JSONContent[] | undefined): JSONContent[] {
  if (!nodes) {
    return [];
  }

  const result: JSONContent[] = [];

  for (const node of nodes) {
    const filtered = filterUnsupportedTiptapNode(node);

    if (filtered === null) {
      continue;
    }

    if (Array.isArray(filtered)) {
      result.push(...filtered);
      continue;
    }

    result.push(filtered);
  }

  return result;
}

function filterUnsupportedTiptapNode(
  node: JSONContent,
): JSONContent | JSONContent[] | null {
  const type = node.type;

  if (!type) {
    return null;
  }

  if (type === "text") {
    const marks = Array.isArray(node.marks)
      ? node.marks.filter((mark) => SUPPORTED_MARK_TYPES.has(mark.type ?? ""))
      : undefined;

    return {
      type: "text",
      text: typeof node.text === "string" ? node.text : "",
      ...(marks?.length ? { marks } : {}),
    };
  }

  if (!SUPPORTED_NODE_TYPES.has(type)) {
    const salvaged = filterTiptapContentNodes(node.content);
    return salvaged.length > 0 ? salvaged : null;
  }

  const content = filterTiptapContentNodes(node.content);

  if (content.length > 0) {
    return { ...node, content };
  }

  if (LEAF_NODE_TYPES.has(type)) {
    return node;
  }

  return { ...node };
}

function filterUnsupportedTiptapDoc(doc: JSONContent): JSONContent {
  return {
    type: "doc",
    content: filterTiptapContentNodes(doc.content),
  };
}

const ALLOWED_TAGS = [
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "strong",
  "em",
  "br",
  "img",
  "blockquote",
  "a",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
] as const;

export function sanitizeBlogHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [...ALLOWED_TAGS],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "loading", "decoding"],
      th: ["colspan", "rowspan", "scope"],
      td: ["colspan", "rowspan"],
    },
    allowedSchemes: ["https"],
    allowedSchemesByTag: {
      img: ["https"],
      a: ["https"],
    },
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: "a",
        attribs: {
          ...attribs,
          target: "_blank",
          rel: "noopener noreferrer nofollow",
        },
      }),
      img: (_tagName, attribs) => ({
        tagName: "img",
        attribs: {
          ...attribs,
          loading: "lazy",
          decoding: "async",
        },
      }),
    },
  });
}

export function tiptapJsonToSanitizedHtml(content: unknown): string {
  if (typeof content === "string") {
    return sanitizeBlogHtml(content);
  }

  if (!content || typeof content !== "object") {
    return "";
  }

  const doc = content as JSONContent;

  if (doc.type !== "doc" || !Array.isArray(doc.content)) {
    return "";
  }

  try {
    const filtered = filterUnsupportedTiptapDoc(doc);
    const html = generateHTML(filtered, tiptapExtensions);
    return sanitizeBlogHtml(html);
  } catch {
    return "";
  }
}
