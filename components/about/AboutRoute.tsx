"use client";

import useIsMobile from "../../hooks/useIsMobile";
import AboutMePage from "./AboutMePage";
import MobileAbout from "./MobileAbout";

export default function AboutRoute() {
  const { isMounted, isMobile } = useIsMobile();

  if (!isMounted) {
    return null;
  }

  return isMobile ? <MobileAbout /> : <AboutMePage />;
}
