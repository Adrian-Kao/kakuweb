"use client";

import useIsMobile from "../../hooks/useIsMobile";
import type { HomeSlide } from "../../lib/sanity/types";
import DesktopHome from "./DesktopHome";
import MobileHome from "./MobileHome";

type HomeRouteProps = {
  slides: HomeSlide[];
};

export default function HomeRoute({ slides }: HomeRouteProps) {
  const { isMounted, isMobile } = useIsMobile();

  if (!isMounted) {
    return null;
  }

  return isMobile ? <MobileHome slides={slides} /> : <DesktopHome slides={slides} />;
}
