import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "./cn";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-(--blog-radius-md) text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-(--blog-border) focus-visible:ring-[3px] focus-visible:ring-(--blog-focus-ring)/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-(--blog-button-bg) text-(--blog-button-fg) hover:bg-(--blog-button-bg-hover)",
        outline:
          "border border-(--blog-border) bg-(--blog-surface) text-(--blog-subtle-fg) shadow-xs hover:bg-(--blog-surface-muted)",
        ghost: "text-(--blog-subtle-fg) hover:bg-(--blog-surface-muted)",
        link: "text-(--blog-accent) underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 gap-1.5 px-3",
        lg: "h-10 px-6",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface BlogButtonProps
  extends ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function BlogButton({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: BlogButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="blog-button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { buttonVariants };
