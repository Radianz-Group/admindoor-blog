import type { ReactNode } from "react";

import { cn } from "./cn";

export interface BlogSectionProps {
  id?: string;
  className?: string;
  children: ReactNode;
}

export function BlogSection({ id, className, children }: BlogSectionProps) {
  return (
    <section id={id} className={cn("w-full py-10 md:py-12", className)}>
      <div className="blog-page-width px-4 md:px-6">{children}</div>
    </section>
  );
}
