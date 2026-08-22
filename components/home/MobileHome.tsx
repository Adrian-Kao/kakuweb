"use client";

import type { HomeSlide } from "../../lib/sanity/types";
import MobileShell from "../mobile/MobileShell";
import HomeSlideshowBackground from "./HomeSlideshowBackground";

// Frontend typography/color settings: mobile Home text, accent, and background classes are in className strings below.

const homeTitleLines = ["野次馬工作室", ""];
type MobileHomeProps = {
  slides?: HomeSlide[];
};

export default function MobileHome({ slides }: MobileHomeProps) {
  return (
    <MobileShell>
      <div className="relative min-h-screen overflow-hidden bg-[#050505] px-6 py-8 text-[#f3eee6]">
        <HomeSlideshowBackground slides={slides} />

        <section className="relative z-10">
         
          <h1 className="font-source-han text-5xl font-black leading-[0.95] tracking-normal text-[#f4f0e8] sm:text-6xl">
              {homeTitleLines.map((line) => (
                <span key={line} className="block whitespace-nowrap">
                  {line}
                </span>
              ))}
            </h1>
         
        </section>
      </div>
    </MobileShell>
  );
}
