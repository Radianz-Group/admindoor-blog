import { createBlogSearchPage } from "admindoor-blog/next";

import { blogConfig } from "@/lib/blog-config";
import { listingUi } from "@/lib/blog-ui";

const searchPage = createBlogSearchPage(blogConfig, { ui: listingUi });

export const generateMetadata = searchPage.generateMetadata;
export default searchPage.default;
