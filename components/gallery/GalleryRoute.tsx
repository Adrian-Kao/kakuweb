"use client";

import useIsMobile from "../../hooks/useIsMobile";
import type { GalleryData } from "../../lib/sanity/data";
import GalleryGrid from "./GalleryGrid";
import MobileGallery from "./MobileGallery";

type GalleryRouteProps = {
  forcedSeriesSlug?: string;
  data: GalleryData;
};

export default function GalleryRoute({ forcedSeriesSlug, data }: GalleryRouteProps) {
  const { isMounted, isMobile } = useIsMobile();

  if (!isMounted) {
    return null;
  }

  return isMobile ? (
    <MobileGallery forcedSeriesSlug={forcedSeriesSlug} data={data} />
  ) : (
    <GalleryGrid forcedSeriesSlug={forcedSeriesSlug} data={data} />
  );
}
