"use client";

import MobileShell from "../mobile/MobileShell";
import HomeSlideshowBackground from "./HomeSlideshowBackground";

export default function MobileHome() {
  return (
    <MobileShell>
      <div className="relative min-h-screen overflow-hidden bg-[#050505] px-6 py-8 text-[#f3eee6]">
        <HomeSlideshowBackground />

        <section className="relative z-10">
          <p className="text-xs uppercase tracking-[0.42em] text-[#c9a46a]">
            這邊可以放座右銘
          </p>
          <h1 className="mt-5 max-w-[16rem] text-5xl font-light leading-[0.95] text-[#f3eee6]">
            KAKU FOTO
          </h1>
          <p className="mt-7 max-w-xs text-sm leading-7 text-[rgba(243,238,230,0.62)]">
            Photographer 
          </p>
        </section>
      </div>
    </MobileShell>
  );
}
