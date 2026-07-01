"use client";

import useIsMobile from "../../hooks/useIsMobile";
import BlankSectionPage from "../BlankSectionPage";
import MobileContact from "./MobileContact";

export default function ContactRoute() {
  const { isMounted, isMobile } = useIsMobile();

  if (!isMounted) {
    return null;
  }

  return isMobile ? <MobileContact /> : <BlankSectionPage label="FILM" />;
}
