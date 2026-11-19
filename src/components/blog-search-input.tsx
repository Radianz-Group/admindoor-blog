"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useState, type FormEvent } from "react";

import { normalizeSearchQuery, truncateSearchQuery } from "admindoor-blog";
import {
  DEFAULT_SEARCH_BUTTON_LABEL,
  DEFAULT_SEARCH_LABEL,
} from "admindoor-blog/constants";
import { BlogButton } from "./primitives/button";
import { cn } from "./primitives/cn";
import type { BlogSearchClassNames } from "./ui-types";

export interface BlogSearchInputProps {
  basePath: string;
  listingPageOneUrl: string;
  queryParam: string;
  maxQueryLength: number;
  placeholder: string;
  initialQuery?: string;
  classNames?: BlogSearchClassNames;
  onSearch?: (query: string) => void;
}

export function BlogSearchInput({
  basePath,
  listingPageOneUrl,
  queryParam,
  maxQueryLength,
  placeholder,
  initialQuery = "",
  classNames,
  onSearch,
}: BlogSearchInputProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  useLayoutEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedQuery = normalizeSearchQuery(
      truncateSearchQuery(query, maxQueryLength),
    );

    if (!normalizedQuery) {
      router.push(listingPageOneUrl);
      return;
    }

    if (onSearch) {
      onSearch(normalizedQuery);
      return;
    }

    const searchParams = new URLSearchParams({ [queryParam]: normalizedQuery });
    router.push(`${basePath}?${searchParams.toString()}`);
  }

  return (
    <div className={cn("mx-auto w-full max-w-2xl", classNames?.root)}>
      <form
        role="search"
        onSubmit={handleSubmit}
        className={cn("flex gap-2", classNames?.form)}
      >
        <label htmlFor="blog-search" className="sr-only">
          {DEFAULT_SEARCH_LABEL}
        </label>
        <input
          id="blog-search"
          type="search"
          value={query}
          maxLength={maxQueryLength}
          placeholder={placeholder}
          onChange={(event) => setQuery(event.target.value)}
          className={cn(
            "min-w-0 flex-1 rounded-(--blog-radius-md) border border-(--blog-border) bg-(--blog-surface) px-4 py-2 text-(--blog-fg) outline-none placeholder:text-(--blog-subtle-fg) focus-visible:ring-[3px] focus-visible:ring-(--blog-focus-ring)/40",
            classNames?.input,
          )}
        />
        <BlogButton type="submit" className={classNames?.button}>
          <Search aria-hidden="true" className="size-4" />
          {DEFAULT_SEARCH_BUTTON_LABEL}
        </BlogButton>
      </form>
    </div>
  );
}
