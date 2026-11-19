"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Mail,
  MessageCircle,
  Share2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import {
  BlogDialog,
  BlogDialogContent,
  BlogDialogDescription,
  BlogDialogHeader,
  BlogDialogTitle,
  BlogDialogTrigger,
} from "./primitives/dialog";
import { BlogButton } from "./primitives/button";
import { cn } from "./primitives/cn";
import {
  appendUtm,
  buildShareHref,
  DEFAULT_SHARE_PLATFORMS,
  SHARE_PLATFORM_LABELS,
  type ShareChannel,
  type SharePlatform,
  type ShareUtm,
} from "./share-links";
import type { BlogPostShareClassNames } from "./ui-types";

export interface BlogPostShareProps {
  url: string;
  title: string;
  platforms?: SharePlatform[];
  /** UTM settings; omit to share the clean URL. */
  utm?: ShareUtm;
  className?: string;
  classNames?: BlogPostShareClassNames;
}

function svgIcon(path: string): ReactNode {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-5">
      <path d={path} />
    </svg>
  );
}

const PLATFORM_ICONS: Record<SharePlatform, ReactNode> = {
  whatsapp: <MessageCircle className="size-5" aria-hidden />,
  x: svgIcon(
    "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  ),
  facebook: svgIcon(
    "M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.026 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971h-1.513c-1.491 0-1.956.931-1.956 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z",
  ),
  linkedin: svgIcon(
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  ),
  telegram: svgIcon(
    "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z",
  ),
  reddit: svgIcon(
    "M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.1 3.1 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z",
  ),
  email: <Mail className="size-5" aria-hidden />,
};

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand("copy");
      el.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

function ScrollRow({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLUListElement>(null);
  const [state, setState] = useState({ scrollable: false, start: false, end: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setState({
      scrollable: el.scrollWidth > el.clientWidth + 1,
      start: el.scrollLeft > 1,
      end: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [update]);

  function scrollByPage(direction: -1 | 1) {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.7, behavior: "smooth" });
  }

  // Items center via auto margins on the first/last child (see BlogPostShare): unlike
  // justify-center they collapse to 0 on overflow, so the start of the list stays scrollable.
  // Arrows sit beside the list (never over it) and stay mounted while the list is scrollable,
  // only disabling at the ends, so repeated clicks can't fall through onto a share link.
  const arrowClass =
    "mt-2 flex size-8 shrink-0 items-center justify-center rounded-full border border-(--blog-border) bg-(--blog-surface) text-(--blog-subtle-fg) transition-colors outline-none hover:bg-(--blog-surface-muted) focus-visible:ring-[3px] focus-visible:ring-(--blog-focus-ring)/40 disabled:pointer-events-none disabled:opacity-40";

  return (
    <div className="flex items-start gap-2">
      {state.scrollable ? (
        <button
          type="button"
          aria-label="Scroll left"
          disabled={!state.start}
          onClick={() => scrollByPage(-1)}
          className={arrowClass}
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>
      ) : null}
      <ul
        ref={ref}
        onScroll={update}
        className={cn(
          "flex min-w-0 flex-1 gap-4 overflow-x-auto pb-3 scrollbar-thin",
          className,
        )}
      >
        {children}
      </ul>
      {state.scrollable ? (
        <button
          type="button"
          aria-label="Scroll right"
          disabled={!state.end}
          onClick={() => scrollByPage(1)}
          className={arrowClass}
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

export function BlogPostShare({
  url,
  title,
  platforms = DEFAULT_SHARE_PLATFORMS,
  utm,
  className,
  classNames,
}: BlogPostShareProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setCanNativeShare(
      typeof navigator !== "undefined" && typeof navigator.share === "function",
    );
    return () => clearTimeout(timer.current);
  }, []);

  const urlFor = (channel: ShareChannel) => appendUtm(url, utm, channel);

  async function handleCopy() {
    if (await copyText(urlFor("copy"))) {
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    }
  }

  const itemClass =
    "flex size-12 items-center justify-center rounded-full bg-(--blog-surface-muted) text-(--blog-subtle-fg) transition-colors outline-none hover:bg-(--blog-border) focus-visible:ring-[3px] focus-visible:ring-(--blog-focus-ring)/40";

  return (
    <BlogDialog>
      <BlogDialogTrigger asChild>
        <BlogButton
          variant="outline"
          size="sm"
          data-slot="blog-share-trigger"
          className={cn(
            "shrink-0 rounded-full @max-[16rem]:size-8 @max-[16rem]:px-0",
            className,
            classNames?.trigger,
          )}
        >
          <Share2 aria-hidden className={classNames?.triggerIcon} />
          <span className={cn("@max-[16rem]:sr-only", classNames?.triggerLabel)}>
            Share
          </span>
        </BlogButton>
      </BlogDialogTrigger>
      <BlogDialogContent
        className={classNames?.content}
        overlayClassName={classNames?.overlay}
        aria-describedby={undefined}
      >
        <BlogDialogHeader className={classNames?.header}>
          <BlogDialogTitle className={classNames?.title}>Share</BlogDialogTitle>
          <BlogDialogDescription className={cn("sr-only", classNames?.description)}>
            Share &ldquo;{title}&rdquo; on social platforms or copy the link.
          </BlogDialogDescription>
        </BlogDialogHeader>

        <ScrollRow className={classNames?.list}>
          {platforms.map((platform) => (
            <li
              key={platform}
              className="flex shrink-0 flex-col items-center gap-1.5 first:ml-auto last:mr-auto"
            >
              <a
                href={buildShareHref(platform, { url: urlFor(platform), title })}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Share on ${SHARE_PLATFORM_LABELS[platform]}`}
                className={cn(itemClass, classNames?.item)}
              >
                {PLATFORM_ICONS[platform]}
              </a>
              <span
                className={cn("text-xs text-(--blog-muted-fg)", classNames?.itemLabel)}
              >
                {SHARE_PLATFORM_LABELS[platform]}
              </span>
            </li>
          ))}
          {canNativeShare ? (
            <li className="flex shrink-0 flex-col items-center gap-1.5 first:ml-auto last:mr-auto">
              <button
                type="button"
                aria-label="More sharing options"
                className={cn(itemClass, classNames?.item)}
                onClick={() => {
                  void navigator
                    .share({ url: urlFor("native"), title })
                    .catch(() => {});
                }}
              >
                <Share2 className="size-5" aria-hidden />
              </button>
              <span
                className={cn("text-xs text-(--blog-muted-fg)", classNames?.itemLabel)}
              >
                More
              </span>
            </li>
          ) : null}
        </ScrollRow>

        <div
          className={cn(
            "flex items-center gap-2 rounded-(--blog-radius-md) border border-(--blog-border) p-1.5 pl-3",
            classNames?.copyRow,
          )}
        >
          <input
            readOnly
            value={urlFor("copy")}
            aria-label="Post link"
            onFocus={(event) => event.currentTarget.select()}
            className={cn(
              "min-w-0 flex-1 bg-transparent text-sm text-(--blog-subtle-fg) outline-none",
              classNames?.input,
            )}
          />
          <BlogButton
            size="sm"
            onClick={() => void handleCopy()}
            className={cn(
              "rounded-full max-sm:size-8 max-sm:px-0",
              classNames?.copyButton,
            )}
          >
            {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
            <span className="max-sm:sr-only">{copied ? "Copied" : "Copy link"}</span>
          </BlogButton>
          <span role="status" className="sr-only">
            {copied ? "Link copied to clipboard" : ""}
          </span>
        </div>
      </BlogDialogContent>
    </BlogDialog>
  );
}
