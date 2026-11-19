export interface AdmindoorAuthor {
  name?: string;
  image?: string;
  about?: string;
}

export interface AdmindoorBlogSeoFaq {
  question?: string;
  answer?: string;
}

export interface AdmindoorBlogSeo {
  title?: string;
  description?: string;
  primaryTopic?: string;
  targetQuery?: string;
  tags?: string[];
  summary?: string;
  keyTakeaways?: string[];
  faqs?: AdmindoorBlogSeoFaq[];
  featuredImage?: string;
  robotsIndex?: boolean;
  schemaType?: string;
}

export interface AdmindoorBlogPost {
  urlSlug?: string;
  title?: string;
  excerpt?: string;
  content?: unknown;
  author?: AdmindoorAuthor;
  seo?: AdmindoorBlogSeo;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdmindoorContentResponse {
  blogs?: AdmindoorBlogPost[];
}
