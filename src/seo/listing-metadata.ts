import type { Metadata } from "next";

import { DEFAULT_LISTING_TITLE } from "../constants";
import type { BlogConfig } from "../core/config-schema";
import { getListingPageUrl } from "../next/paths";
import {
  getSiteMetadataBase,
  isHttpsUrl,
  normalizeTwitterHandle,
  toAbsoluteSiteUrl,
} from "./helpers";

export function buildListingMetadata(
  config: BlogConfig,
  page: number,
  totalPages: number,
): Metadata {
  const listingTitle = config.listing?.title ?? DEFAULT_LISTING_TITLE;
  const listingDescription = config.listing?.subtitle ?? "";
  const openGraphTitle = page === 1 ? listingTitle : `${listingTitle} — Page ${page}`;
  const title =
    page === 1
      ? `${listingTitle} - ${config.site.name}`
      : `${listingTitle} — Page ${page} - ${config.site.name}`;
  const listingPath = getListingPageUrl(config, page);
  const listingUrl = toAbsoluteSiteUrl(config.site.url, listingPath);
  const listingImage = isHttpsUrl(config.site.logoUrl)
    ? config.site.logoUrl
    : undefined;
  const prevPage = page > 1 ? getListingPageUrl(config, page - 1) : undefined;
  const nextPage = page < totalPages ? getListingPageUrl(config, page + 1) : undefined;
  const twitterSite = normalizeTwitterHandle(config.site.twitterHandle);

  return {
    metadataBase: getSiteMetadataBase(config),
    title,
    ...(listingDescription ? { description: listingDescription } : {}),
    alternates: {
      canonical: listingPath,
      ...(prevPage ? { prev: prevPage } : {}),
      ...(nextPage ? { next: nextPage } : {}),
    },
    openGraph: {
      title: openGraphTitle,
      ...(listingDescription ? { description: listingDescription } : {}),
      type: "website",
      url: listingUrl,
      siteName: config.site.name,
      ...(config.locale ? { locale: config.locale } : {}),
      ...(listingImage
        ? {
            images: [
              {
                url: listingImage,
                alt: `${config.site.name} logo`,
                ...(config.site.logoWidth ? { width: config.site.logoWidth } : {}),
                ...(config.site.logoHeight ? { height: config.site.logoHeight } : {}),
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: listingImage ? "summary_large_image" : "summary",
      title: openGraphTitle,
      ...(listingDescription ? { description: listingDescription } : {}),
      ...(listingImage ? { images: [listingImage] } : {}),
      ...(twitterSite ? { site: twitterSite } : {}),
    },
  };
}
