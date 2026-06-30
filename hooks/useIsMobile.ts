"use client";

import { useEffect, useState } from "react";

export default function useIsMobile(breakpoint = 1024) {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    let frame: number | null = null;

    const update = () => {
      setIsMobile(mediaQuery.matches);
    };

    frame = requestAnimationFrame(() => {
      update();
      setIsMounted(true);
    });
    mediaQuery.addEventListener("change", update);

    return () => {
      if (frame) {
        cancelAnimationFrame(frame);
      }

      mediaQuery.removeEventListener("change", update);
    };
  }, [breakpoint]);

  return { isMounted, isMobile };
}
