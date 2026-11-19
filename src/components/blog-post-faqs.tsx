"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

import type { BlogPostFaq } from "admindoor-blog";
import { BlogSection } from "./primitives/blog-section";
import { cn } from "./primitives/cn";
import type { BlogPostFaqsClassNames } from "./ui-types";

export interface BlogPostFaqsProps {
  items: BlogPostFaq[];
  title?: string;
  className?: string;
  classNames?: BlogPostFaqsClassNames;
}

export function BlogPostFaqs({
  items,
  title = "FAQs",
  className,
  classNames,
}: BlogPostFaqsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <BlogSection className="py-8! md:py-10!">
      <div
        data-slot="blog-faqs"
        className={cn("blog-page-width space-y-4", className, classNames?.root)}
      >
        <h2
          className={cn(
            "text-xl font-semibold text-(--blog-fg) md:text-2xl",
            classNames?.title,
          )}
        >
          {title}
        </h2>
        <div
          className={cn(
            "rounded-(--blog-radius-md) border border-(--blog-border) bg-(--blog-surface)/70 px-5 py-2 md:px-6 md:py-4",
            classNames?.box,
          )}
        >
          <Accordion.Root type="single" collapsible className="w-full">
            {items.map((faq, index) => (
              <Accordion.Item
                key={faq.question}
                value={`faq-${index}`}
                className={cn(
                  "border-b border-(--blog-border) last:border-b-0",
                  classNames?.item,
                )}
              >
                <Accordion.Header>
                  <Accordion.Trigger
                    className={cn(
                      "group flex w-full items-center justify-between gap-3 py-4 text-left text-sm text-(--blog-fg) md:text-base",
                      classNames?.trigger,
                    )}
                  >
                    {faq.question}
                    <ChevronDown className="h-4 w-4 shrink-0 text-(--blog-muted-fg) transition-transform group-data-[state=open]:rotate-180" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content
                  forceMount
                  className={cn(
                    "overflow-hidden pb-4 text-sm whitespace-pre-line text-(--blog-subtle-fg) md:text-base",
                    "data-[state=closed]:hidden",
                    classNames?.content,
                  )}
                >
                  {faq.answer}
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </div>
      </div>
    </BlogSection>
  );
}
