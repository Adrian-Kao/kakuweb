"use client";

import { useEffect } from "react";
import type { GalleryPhoto } from "../../data/gallery";

type PhotoViewerOverlayProps = {
  photo: GalleryPhoto;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onGoToGallery?: (photo: GalleryPhoto) => void;
};

export default function PhotoViewerOverlay({
  photo,
  onClose,
  onNext,
  onPrevious,
  onGoToGallery,
}: PhotoViewerOverlayProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowRight") {
        onNext?.();
      }

      if (event.key === "ArrowLeft") {
        onPrevious?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrevious]);

  return (
  <div
    className="fixed inset-0 z-[9999] bg-[#050505]/90 text-[#f3eee6] backdrop-blur-md"
    style={{ height: "100dvh" }}
    onClick={onClose}
  >
    <button
      type="button"
      aria-label="Close photo viewer"
      onClick={(event) => {
        event.stopPropagation();
        onClose();
      }}
      className="absolute right-5 top-5 z-50 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#f3eee6]/80"
    >
      Close
    </button>

    {onPrevious ? (
      <button
        type="button"
        aria-label="Previous photo"
        onClick={(event) => {
          event.stopPropagation();
          onPrevious();
        }}
        className="absolute left-4 top-1/2 z-50 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/35 text-3xl font-light text-[#f3eee6]/70"
      >
        ‹
      </button>
    ) : null}

    <div
      className="flex h-full w-full items-center justify-center px-4 py-20"
      onClick={(event) => event.stopPropagation()}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.imageUrl}
        alt={photo.alt || photo.title}
        className="block max-w-full animate-[galleryFocus_360ms_ease-out] object-contain shadow-[0_50px_160px_rgba(0,0,0,0.72)]"
        style={{
          maxHeight: "calc(100dvh - 180px)",
        }}
      />
    </div>

    {onNext ? (
      <button
        type="button"
        aria-label="Next photo"
        onClick={(event) => {
          event.stopPropagation();
          onNext();
        }}
        className="absolute right-4 top-1/2 z-50 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/35 text-3xl font-light text-[#f3eee6]/70"
      >
        ›
      </button>
    ) : null}

    <div
      className="absolute bottom-5 left-5 right-5 z-40 text-center"
      onClick={(event) => event.stopPropagation()}
    >
      <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[#c9a46a]">
        {photo.year} / {photo.categoryName}
      </p>
      <h2 className="mt-2 text-sm font-light tracking-[0.08em] text-[#f3eee6]">
        {photo.seriesTitle}
      </h2>
    </div>
  </div>
);
}