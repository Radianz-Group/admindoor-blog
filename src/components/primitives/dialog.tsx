"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "./cn";

export const BlogDialog = DialogPrimitive.Root;
export const BlogDialogTrigger = DialogPrimitive.Trigger;
export const BlogDialogClose = DialogPrimitive.Close;

export function BlogDialogContent({
  className,
  overlayClassName,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & { overlayClassName?: string }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        data-slot="blog-dialog-overlay"
        className={cn(
          "blog-dialog-overlay fixed inset-0 z-50 bg-black/50",
          overlayClassName,
        )}
      />
      <DialogPrimitive.Content
        data-slot="blog-dialog-content"
        data-blog-root
        className={cn(
          "blog-root blog-dialog-content fixed z-50 grid w-full grid-cols-[minmax(0,1fr)] gap-4 border border-(--blog-border) bg-(--blog-surface) p-5 text-(--blog-fg) shadow-lg outline-none",
          "bottom-0 left-0 rounded-t-(--blog-radius) sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-(--blog-radius)",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          aria-label="Close"
          className="absolute top-4 right-4 rounded-(--blog-radius-md) p-1 text-(--blog-muted-fg) transition-colors outline-none hover:bg-(--blog-surface-muted) focus-visible:ring-[3px] focus-visible:ring-(--blog-focus-ring)/40"
        >
          <X className="size-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function BlogDialogHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1.5 pr-8", className)} {...props} />;
}

export function BlogDialogTitle({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

export function BlogDialogDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-sm text-(--blog-muted-fg)", className)}
      {...props}
    />
  );
}
