"use client";

import useIsMobile from "../../hooks/useIsMobile";
import DesktopContact from "./DesktopContact";
import MobileContact from "./MobileContact";

export default function ContactRoute() {
  const { isMounted, isMobile } = useIsMobile();

  if (!isMounted) {
    return null;
  }

  return isMobile ? <MobileContact /> : <DesktopContact />;
}
