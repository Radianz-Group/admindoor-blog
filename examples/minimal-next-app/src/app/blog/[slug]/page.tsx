import { createBlogPostPage } from "admindoor-blog/next";

import { blogConfig } from "@/lib/blog-config";
import { postUi } from "@/lib/blog-ui";

const postPage = createBlogPostPage(blogConfig, { homeHref: "/", ui: postUi });

export const generateStaticParams = postPage.generateStaticParams;
export const generateMetadata = postPage.generateMetadata;
export default postPage.default;
