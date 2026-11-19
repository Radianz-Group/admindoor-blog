import {
  BLOG_OG_IMAGE_CONTENT_TYPE,
  BLOG_OG_IMAGE_SIZE,
  createBlogPostOpengraphImage,
} from "admindoor-blog/next";

import { blogConfig } from "@/lib/blog-config";

export const alt = "Blog cover";
export const size = BLOG_OG_IMAGE_SIZE;
export const contentType = BLOG_OG_IMAGE_CONTENT_TYPE;

export default createBlogPostOpengraphImage(blogConfig);
