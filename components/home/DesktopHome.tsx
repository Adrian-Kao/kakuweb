"use client";

import { useState } from "react";
import type { HomeSlide } from "../../lib/sanity/types";
import PortfolioNavigation from "../PortfolioNavigation";
import HomeSlideshowBackground from "./HomeSlideshowBackground";

// Frontend typography/color settings: desktop Home headline, accent, and background classes are in className strings below.
type DesktopHomeProps = {
  slides?: HomeSlide[];
};

// Each item is rendered on its own line. Move text between items to change the line break.
const homeTitleLines = ["野次馬工作室", ""];

export default function DesktopHome({ slides }: DesktopHomeProps) {
  const [isMenuHovered, setIsMenuHovered] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-[#f4f0e8]">
      <HomeSlideshowBackground dimmed={isMenuHovered} slides={slides} />

      <main className="relative z-10 flex h-screen overflow-hidden px-7 py-8 sm:px-12 lg:px-20 lg:py-0">
        <section
          className="flex min-h-[42vh] flex-col justify-between py-8 lg:min-h-0 lg:w-[22%] lg:py-14"
          onMouseEnter={() => setIsMenuHovered(true)}
          onMouseLeave={() => setIsMenuHovered(false)}
          onFocus={() => setIsMenuHovered(true)}
          onBlur={() => setIsMenuHovered(false)}
        >
          <div
            className={[
              "max-w-md transition-opacity duration-300",
              isMenuHovered ? "opacity-100" : "opacity-35",
            ].join(" ")}
          >
           

            <h1 className="font-sans text-5xl font-black leading-[0.95] tracking-normal text-[#f4f0e8] sm:text-6xl">
              {homeTitleLines.map((line) => (
                <span key={line} className="block whitespace-nowrap">
                  {line}
                </span>
              ))}
            </h1>


          </div>

          <div
            className={[
              "transition-opacity duration-300",
              isMenuHovered ? "opacity-100" : "opacity-35",
            ].join(" ")}
          >
            <PortfolioNavigation />
          </div>
        </section>
      </main>
    </div>
  );
}
