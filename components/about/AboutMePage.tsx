"use client";

import Image from "next/image";
import { useState } from "react";
import PortfolioNavigation from "../PortfolioNavigation";

// Frontend typography/color settings: this page's darkroom palette, text sizes, and font weights are controlled by Tailwind classes below.
export default function AboutMePage() {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-[#f3eee6]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-[url('/about-portrait.png')] bg-cover bg-[center_right_18%] opacity-45 transition-[filter,opacity] duration-[900ms] ease-out"
          style={{
            filter: isFocused
              ? "grayscale(1) brightness(0.55) contrast(1.18)"
              : "grayscale(1) brightness(0.43) contrast(1.12)",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,0.96)_0%,rgba(5,5,5,0.72)_34%,rgba(5,5,5,0.34)_72%,rgba(5,5,5,0.2)_100%)]" />
        <div
          className={[
            "absolute right-[16%] top-[28%] h-64 w-64 rounded-full bg-[rgba(243,238,230,0.08)] blur-3xl transition-opacity duration-[900ms]",
            isFocused ? "opacity-100" : "opacity-35",
          ].join(" ")}
        />
        <div className="absolute inset-0 opacity-[0.08] mix-blend-screen [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.38)_0_1px,transparent_1px)] [background-size:10px_10px]" />
      </div>

      <main className="relative z-10 grid min-h-screen grid-cols-1 gap-12 px-7 py-8 sm:px-12 lg:grid-cols-[11%_minmax(0,1fr)] lg:px-20 lg:py-12">
        <aside className="flex min-h-[34vh] flex-col justify-between lg:min-h-0">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.42em] text-[#c9a46a]">
              野次馬工作室
            </p>
            <p className="mt-14 text-5xl font-light uppercase leading-none tracking-[0.08em] text-[#f3eee6] sm:text-6xl">
              About
            </p>
          </div>

          <PortfolioNavigation className="mt-10" />
        </aside>

        <section
          className="relative min-h-[72vh] overflow-hidden lg:min-h-0"
          onMouseEnter={() => setIsFocused(true)}
          onMouseLeave={() => setIsFocused(false)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          <div className="relative z-10 flex min-h-full items-center px-8 py-14 sm:px-12 lg:px-16">
            <div className="max-w-[34rem]">
              <p className="mt-8 text-base leading-8 text-[rgba(243,238,230,0.68)]">
                KAKU，1986年生，現居於台灣新北市的自由接案攝影師。近年著重於被攝體、拍照者、相片觀者，三者的相互關係，並以此促使照片的成立。
              </p>

              <div className="mt-10 flex items-center gap-5">
                <a
                  aria-label="Open Instagram"
                  href="https://www.instagram.com/kaku_foto?igsh=MWh5dzRzZm90cXRscw=="
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center opacity-75 transition hover:opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[#c9a46a]"
                >
                  <Image
                    src="/instagram.svg"
                    alt=""
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain invert"
                  />
                </a>
                <a
                  aria-label="Open Threads"
                  href="https://www.threads.com/@kaku_foto"
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center opacity-75 transition hover:opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[#c9a46a]"
                >
                  <Image
                    src="/thread.png"
                    alt=""
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain invert"
                  />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
