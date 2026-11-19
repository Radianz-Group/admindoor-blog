import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "./cn";

const badgeVariants = cva(
  "inline-flex w-fit min-w-0 max-w-full items-center justify-center gap-1 overflow-hidden rounded-(--blog-radius-md) border px-3 py-0.5 text-xs font-medium transition-[color,box-shadow]",
  {
    variants: {
      variant: {
        default: "border-transparent bg-(--blog-surface-muted) text-(--blog-subtle-fg)",
        secondary:
          "border-transparent bg-(--blog-accent-muted) text-(--blog-accent-fg)",
        outline: "border-(--blog-border) text-(--blog-subtle-fg)",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BlogBadgeProps
  extends ComponentProps<"span">, VariantProps<typeof badgeVariants> {}

export function BlogBadge({ className, variant, children, ...props }: BlogBadgeProps) {
  return (
    <span
      data-slot="blog-badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    >
      <span className="min-w-0 truncate">{children}</span>
    </span>
  );
}

export { badgeVariants };
