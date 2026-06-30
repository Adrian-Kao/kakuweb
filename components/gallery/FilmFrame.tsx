"use client";

import type { GalleryPhoto } from "../../data/gallery";

type FilmFrameProps = {
  photo: GalleryPhoto;
  onSelect: (photo: GalleryPhoto) => void;
};

export default function FilmFrame({ photo, onSelect }: FilmFrameProps) {
  const isLandscape = photo.orientation === "landscape";

  return (
    <button
      type="button"
      onClick={() => onSelect(photo)}
      className="group relative w-full cursor-pointer bg-[#2c221d] p-4 text-left shadow-[0_22px_60px_rgba(0,0,0,0.36)] transition duration-300 hover:brightness-110 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[#c9a46a]"
    >
      <div className="pointer-events-none absolute inset-y-3 left-1.5 flex flex-col justify-between">
        {Array.from({ length: 8 }).map((_, index) => (
          <span key={index} className="h-2.5 w-1.5 rounded-full bg-[#050505]" />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-3 right-1.5 flex flex-col justify-between">
        {Array.from({ length: 8 }).map((_, index) => (
          <span key={index} className="h-2.5 w-1.5 rounded-full bg-[#050505]" />
        ))}
      </div>

      <div
        className={[
          "relative mx-4 overflow-hidden border border-black/50 bg-[#120f0d]",
          isLandscape ? "aspect-[5/4]" : "aspect-[4/5]",
        ].join(" ")}
      >
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(243,238,230,0.18),rgba(243,238,230,0.03)_38%,rgba(0,0,0,0.52)),radial-gradient(circle_at_54%_32%,rgba(201,164,106,0.24),transparent_36%)] transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 opacity-[0.16] mix-blend-screen [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.45)_0_1px,transparent_1px)] [background-size:9px_9px]" />
        <span className="absolute left-4 top-4 text-[0.62rem] uppercase tracking-[0.24em] text-[rgba(243,238,230,0.54)]">
          {photo.year}
        </span>
      </div>

      <div className="mx-4 mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#f3eee6]">
            {photo.title}
          </p>
          <p className="mt-1 text-[0.68rem] uppercase tracking-[0.18em] text-[rgba(243,238,230,0.42)]">
            {photo.tone}
          </p>
        </div>
        <span className="h-px w-8 bg-[#c9a46a]/70" />
      </div>
    </button>
  );
}
