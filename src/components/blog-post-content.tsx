export interface BlogPostContentProps {
  html: string;
  className?: string;
}

/**
 * Renders pre-sanitized blog HTML produced at build time from TipTap JSON.
 */
export function BlogPostContent({ html, className }: BlogPostContentProps) {
  if (!html) {
    return null;
  }

  try {
    return (
      <div
        className={className ? `blog-content ${className}` : "blog-content"}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch {
    return (
      <p className="text-sm text-slate-500 italic" role="status">
        This section could not be displayed.
      </p>
    );
  }
}
