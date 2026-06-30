"use client";

import useIsMobile from "../../hooks/useIsMobile";
import GalleryGrid from "./GalleryGrid";
import MobileGallery from "./MobileGallery";

type GalleryRouteProps = {
  forcedSeriesSlug?: string;
};

export default function GalleryRoute({ forcedSeriesSlug }: GalleryRouteProps) {
  const { isMounted, isMobile } = useIsMobile();

  if (!isMounted) {
    return null;
  }

  return isMobile ? (
    <MobileGallery forcedSeriesSlug={forcedSeriesSlug} />
  ) : (
    <GalleryGrid forcedSeriesSlug={forcedSeriesSlug} />
  );
}
