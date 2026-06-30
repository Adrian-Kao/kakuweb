"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { featuredHomePhotos, type GalleryPhoto } from "../../data/gallery";
import { usePageTransition } from "../PageTransition";
import MobileShell from "../mobile/MobileShell";
import PhotoViewerOverlay from "../photo/PhotoViewerOverlay";
import FilmStrip from "./FilmStrip";

const P5Sketch = dynamic(() => import("../P5Sketch"), {
  ssr: false,
});

export default function MobileHome() {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const { transitionTo } = usePageTransition();

  return (
    <MobileShell>
      <div className="relative min-h-screen overflow-hidden bg-[#050505] px-6 py-8 text-[#f3eee6]">
        <P5Sketch intensity="low" />

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

        <section className="relative z-10 mt-14">
          <div className="mb-5 flex items-end justify-between border-b border-white/10 pb-3">
            <p className="text-xs uppercase tracking-[0.28em] text-[#c9a46a]">
              Best of Films
            </p>
            
          </div>
          <FilmStrip
            photos={featuredHomePhotos}
            direction="up"
            onSelect={setSelectedPhoto}
            dimmed={Boolean(selectedPhoto)}
            className="h-[74vh]"
          />
        </section>

        {selectedPhoto ? (
          <PhotoViewerOverlay
            photo={selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
            onGoToGallery={(photo) =>
              transitionTo(`/gallery?series=${photo.seriesSlug}`)
            }
          />
        ) : null}
      </div>
    </MobileShell>
  );
}
