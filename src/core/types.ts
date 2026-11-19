export interface BlogPostFaq {
  question: string;
  answer: string;
}

export interface BlogPostSeo {
  title?: string;
  description?: string;
  primaryTopic?: string;
  targetQuery?: string;
  tags?: string[];
  summary?: string;
  keyTakeaways?: string[];
  faqs?: BlogPostFaq[];
  featuredImage?: string;
  robotsIndex?: boolean;
  schemaType?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  updatedAt?: string;
  imageUrl?: string;
  imageAlt?: string;
  author?: string;
  authorImage?: string;
  authorAbout?: string;
  seo?: BlogPostSeo;
}

export interface BlogContentSource {
  getPosts(): Promise<BlogPost[]>;
}
