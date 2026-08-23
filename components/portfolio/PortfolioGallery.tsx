"use client";

/* eslint-disable @next/next/no-img-element */

import useIsMobile from "../../hooks/useIsMobile";
import type { PortfolioPhoto } from "../../lib/sanity/data";
import PortfolioNavigation from "../PortfolioNavigation";
import MobileShell from "../mobile/MobileShell";

type PortfolioGalleryProps = {
  photos: PortfolioPhoto[];
};

export default function PortfolioGallery({ photos }: PortfolioGalleryProps) {
  const { isMounted, isMobile } = useIsMobile();

  if (!isMounted) {
    return null;
  }

  if (isMobile) {
    return (
      <MobileShell>
        <main className="min-h-screen bg-[#050505] px-6 py-8 text-[#f3eee6]">

          <h1 className="mt-5 text-5xl font-light uppercase tracking-[0.08em]">
            Portfolio
          </h1>

          <PortfolioMasonry photos={photos} className="mt-12 columns-1 sm:columns-2" />
        </main>
      </MobileShell>
    );
  }

  return (
    <div className="relative h-screen overflow-hidden bg-[#050505] text-[#f3eee6]">
      <main className="relative z-10 grid h-screen grid-cols-[clamp(12rem,11vw,14rem)_minmax(0,1fr)] gap-14 overflow-hidden px-20 py-12">
        <aside className="flex h-[calc(100vh-6rem)] flex-col justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.42em] text-[#c9a46a]">
              野次馬工作室
            </p>
            <h1 className="mt-14 max-w-full break-words text-[clamp(2rem,2.4vw,3rem)] font-light uppercase leading-none tracking-[0.08em]">
              Portfolio
            </h1>
          </div>

          <PortfolioNavigation className="mt-14" />
        </aside>

        <section className="scrollbar-hidden h-[calc(100vh-6rem)] min-w-0 overflow-y-auto overscroll-contain pb-20 pr-3">
          <PortfolioMasonry photos={photos} className="columns-2 xl:columns-3" />
        </section>
      </main>
    </div>
  );
}

function PortfolioMasonry({
  photos,
  className,
}: {
  photos: PortfolioPhoto[];
  className: string;
}) {
  if (photos.length === 0) {
    return <div className="min-h-[55vh]" aria-label="No portfolio photos" />;
  }

  return (
    <div className={`${className} w-full gap-8`}>
      {photos.map((photo) => (
        <figure key={photo.id} className="mb-8 break-inside-avoid">
          <img
            src={photo.imageUrl}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            loading="lazy"
            className="block h-auto w-full transition duration-500 hover:brightness-110"
          />
        </figure>
      ))}
    </div>
  );
}
