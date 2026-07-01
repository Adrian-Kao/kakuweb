"use client";

import { useState } from "react";
import PortfolioNavigation from "../PortfolioNavigation";
import HomeSlideshowBackground from "./HomeSlideshowBackground";

export default function DesktopHome() {
  const [isMenuHovered, setIsMenuHovered] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-[#f4f0e8]">
      <HomeSlideshowBackground dimmed={isMenuHovered} />

      <main className="relative z-10 flex h-screen overflow-hidden px-7 py-8 sm:px-12 lg:px-20 lg:py-0">
        <section
          className="flex min-h-[42vh] flex-col justify-between py-8 lg:min-h-0 lg:py-14"
          onMouseEnter={() => setIsMenuHovered(true)}
          onMouseLeave={() => setIsMenuHovered(false)}
          onFocus={() => setIsMenuHovered(true)}
          onBlur={() => setIsMenuHovered(false)}
        >
          <div className="max-w-md">
            <p className="mb-10 text-xs font-medium uppercase tracking-[0.42em] text-[#d8b16f]">
              KAKU PHOTOGRAPHY
            </p>

            <h1 className="max-w-sm text-5xl font-light leading-[0.95] tracking-normal text-[#f4f0e8] sm:text-6xl">
              KAKU FOTO
            </h1>

            <div className="mt-7 space-y-4">
              <p className="max-w-xs text-base leading-7 text-[rgba(244,240,232,0.6)]">
                Light reveals. Shadow remembers.
              </p>
            </div>
          </div>

          <PortfolioNavigation />
        </section>
      </main>
    </div>
  );
}
