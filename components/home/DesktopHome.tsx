"use client";

import dynamic from "next/dynamic";
import PortfolioNavigation from "../PortfolioNavigation";
import HomeFilmStrips from "./HomeFilmStrips";

const P5Sketch = dynamic(() => import("../P5Sketch"), {
  ssr: false,
});

export default function DesktopHome() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#050505] text-[#f4f0e8]">
      <P5Sketch />

      <main className="relative z-10 grid h-screen grid-cols-1 gap-10 overflow-hidden px-7 py-8 sm:px-12 lg:grid-cols-[38%_62%] lg:px-20 lg:py-0">
        <section className="flex min-h-[42vh] flex-col justify-between py-8 lg:min-h-0 lg:py-14">
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

        <HomeFilmStrips />
      </main>
    </div>
  );
}
