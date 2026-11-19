import { createBlogListingPage } from "admindoor-blog/next";

import { blogConfig } from "@/lib/blog-config";
import { listingUi } from "@/lib/blog-ui";

const listingPage = createBlogListingPage(blogConfig, { ui: listingUi });

export const generateStaticParams = listingPage.generateStaticParams;
export const generateMetadata = listingPage.generateMetadata;
export default listingPage.default;
