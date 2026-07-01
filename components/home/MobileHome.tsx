"use client";

import type { HomeSlide } from "../../lib/sanity/types";
import MobileShell from "../mobile/MobileShell";
import HomeSlideshowBackground from "./HomeSlideshowBackground";

type MobileHomeProps = {
  slides?: HomeSlide[];
};

export default function MobileHome({ slides }: MobileHomeProps) {
  return (
    <MobileShell>
      <div className="relative min-h-screen overflow-hidden bg-[#050505] px-6 py-8 text-[#f3eee6]">
        <HomeSlideshowBackground slides={slides} />

        <section className="relative z-10">
          <p className="text-xs uppercase tracking-[0.42em] text-[#c9a46a]">
            KAKU PHOTOGRAPHY
          </p>
          <h1 className="mt-5 max-w-[16rem] text-5xl font-light leading-[0.95] text-[#f3eee6]">
            KAKU FOTO
          </h1>
          <p className="mt-7 max-w-xs text-sm leading-7 text-[rgba(243,238,230,0.62)]">
            Photographer / Visual Storyteller
          </p>
        </section>
      </div>
    </MobileShell>
  );
}
