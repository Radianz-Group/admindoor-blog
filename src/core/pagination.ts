const DEFAULT_POSTS_PER_PAGE = 12;

export function getTotalPages(
  totalPosts: number,
  postsPerPage: number = DEFAULT_POSTS_PER_PAGE,
): number {
  if (totalPosts <= 0) return 1;
  return Math.ceil(totalPosts / postsPerPage);
}

export function getPostsForPage<T>(
  posts: T[],
  page: number,
  postsPerPage: number = DEFAULT_POSTS_PER_PAGE,
): T[] {
  const start = (page - 1) * postsPerPage;
  return posts.slice(start, start + postsPerPage);
}

export function parsePageNumber(page: string): number | null {
  const parsed = Number.parseInt(page, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return null;
  return parsed;
}

export function isValidPage(page: number, totalPages: number): boolean {
  return page >= 1 && page <= totalPages;
}

export function getPageNumbers(currentPage: number, totalPages: number): number[] {
  return Array.from({ length: totalPages }, (_, index) => index + 1).filter((page) => {
    if (totalPages <= 7) return true;
    if (page === 1 || page === totalPages) return true;
    return Math.abs(page - currentPage) <= 1;
  });
}
