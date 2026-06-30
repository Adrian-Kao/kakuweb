"use client";

import DesktopHome from "../components/home/DesktopHome";
import MobileHome from "../components/home/MobileHome";
import useIsMobile from "../hooks/useIsMobile";

export default function Home() {
  const { isMounted, isMobile } = useIsMobile();

  if (!isMounted) {
    return null;
  }

  return isMobile ? <MobileHome /> : <DesktopHome />;
}
