"use client";

import Image from "next/image";
import MobileShell from "../mobile/MobileShell";

// Frontend typography/color settings: mobile About text, accent links, and background classes are in className strings below.
export default function MobileAbout() {
  return (
    <MobileShell>
      <div className="relative min-h-screen bg-[#050505] px-6 py-8 text-[#f3eee6]">
        <div className="relative z-10">
          <h1 className="mt-5 text-5xl font-light uppercase tracking-[0.08em]">
            About
          </h1>

          <section className="mt-10">
           
            <p className="mt-7 text-sm leading-7 text-[rgba(243,238,230,0.66)]">
             KAKU，1986年生，現居於台灣新北市的自由接案攝影師。近年著重於被攝體、拍照者、相片觀者，三者的相互關係，並以此促使照片的成立。
            </p>
          </section>

          <div className="mt-10 flex items-center gap-5 border-t border-white/10 pt-8">
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
    </MobileShell>
  );
}
