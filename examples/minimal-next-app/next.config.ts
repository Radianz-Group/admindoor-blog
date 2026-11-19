import type { NextConfig } from "next";
import { getBlogRedirects } from "admindoor-blog/next/redirects";

import { blogConfig } from "./src/lib/blog-config";

const nextConfig: NextConfig = {
  transpilePackages: ["admindoor-blog"],
  // OG cover fetch + sharp per post can exceed the default 60s on larger blogs.
  staticPageGenerationTimeout: 180,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return getBlogRedirects(blogConfig);
  },
};

export default nextConfig;
