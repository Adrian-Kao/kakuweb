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

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-[#050505] text-[#f3eee6] lg:bg-[#050505]/90 lg:backdrop-blur-md"
      style={{
        height: "100dvh",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Close photo viewer"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        className="absolute right-4 top-4 z-50 rounded-full border border-white/15 bg-black/45 px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#f3eee6]/80 lg:right-5 lg:top-5 lg:transition lg:hover:border-[#c9a46a]/70 lg:hover:text-[#f3eee6]"
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
          className="absolute left-3 top-1/2 z-50 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/45 text-3xl font-light text-[#f3eee6]/70 lg:left-4 lg:h-11 lg:w-11 lg:transition lg:hover:border-[#c9a46a]/70 lg:hover:text-[#f3eee6]"
        >
          ‹
        </button>
      ) : null}

      <div
        className="flex h-full w-full items-center justify-center px-0 py-0 lg:px-4 lg:py-20"
        onClick={(event) => event.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.imageUrl}
          alt={photo.alt || photo.title || photo.seriesTitle}
          className="block max-h-[100dvh] max-w-[100vw] object-contain lg:max-h-[calc(100dvh-180px)] lg:max-w-[calc(100vw-32px)] lg:animate-[galleryFocus_360ms_ease-out] lg:shadow-[0_50px_160px_rgba(0,0,0,0.72)]"
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
          className="absolute right-3 top-1/2 z-50 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/45 text-3xl font-light text-[#f3eee6]/70 lg:right-4 lg:h-11 lg:w-11 lg:transition lg:hover:border-[#c9a46a]/70 lg:hover:text-[#f3eee6]"
        >
          ›
        </button>
      ) : null}

      <div
        className="absolute bottom-5 left-5 right-5 z-40 hidden text-center lg:block"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[#c9a46a]">
          {photo.year} / {photo.categoryName}
        </p>

        <h2 className="mt-2 text-sm font-light tracking-[0.08em] text-[#f3eee6]">
          {photo.seriesTitle}
        </h2>

        {onGoToGallery ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onGoToGallery(photo);
            }}
            className="mt-4 border-b border-[#c9a46a] pb-1 text-[0.68rem] uppercase tracking-[0.22em] text-[#c9a46a] transition hover:text-[#f3eee6]"
          >
            Go to Gallery
          </button>
        ) : null}
      </div>
    </div>
  );
}
