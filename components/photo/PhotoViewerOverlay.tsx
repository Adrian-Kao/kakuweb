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
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#050505]/82 px-7 py-8 backdrop-blur-md"
      onClick={onClose}
    >
      {onPrevious ? (
        <button
          type="button"
          aria-label="Previous photo"
          onClick={(event) => {
            event.stopPropagation();
            onPrevious();
          }}
          className="absolute left-6 top-1/2 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 text-3xl font-light text-[#f3eee6]/70 transition hover:border-[#c9a46a]/70 hover:text-[#f3eee6]"
        >
          ‹
        </button>
      ) : null}

      <div
        className="grid max-h-[90vh] w-full max-w-[96vw] grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,70vw)_18rem] lg:gap-16"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative mx-auto flex max-h-[72vh] w-full max-w-full items-center justify-center lg:max-h-[80vh] lg:max-w-[70vw]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.imageUrl}
            alt={photo.alt}
            className="max-h-[72vh] max-w-full animate-[galleryFocus_360ms_ease-out] object-contain shadow-[0_50px_160px_rgba(0,0,0,0.72)] lg:max-h-[80vh] lg:max-w-[70vw]"
          />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-sm lg:mx-0 lg:translate-x-8 lg:pl-6">
          <p className="text-xs uppercase tracking-[0.32em] text-[#c9a46a]">
            {photo.year} / {photo.categoryName}
          </p>
          <h2 className="mt-5 text-3xl font-light tracking-[0.04em] text-[#f3eee6]">
            {photo.seriesTitle}
          </h2>
          <p className="mt-4 text-sm leading-7 text-[rgba(243,238,230,0.62)]">
            {photo.description}
          </p>
          {photo.collaborator ? (
            <p className="mt-6 text-xs uppercase tracking-[0.24em] text-[rgba(243,238,230,0.44)]">
              {photo.collaborator}
            </p>
          ) : null}

          {onGoToGallery ? (
            <button
              type="button"
              onClick={() => onGoToGallery(photo)}
              className="mt-10 border-b border-[#c9a46a] pb-2 text-xs uppercase tracking-[0.28em] text-[#c9a46a] transition hover:text-[#f3eee6]"
            >
              Go to Gallery
            </button>
          ) : null}
        </div>
      </div>

      {onNext ? (
        <button
          type="button"
          aria-label="Next photo"
          onClick={(event) => {
            event.stopPropagation();
            onNext();
          }}
          className="absolute right-6 top-1/2 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 text-3xl font-light text-[#f3eee6]/70 transition hover:border-[#c9a46a]/70 hover:text-[#f3eee6]"
        >
          ›
        </button>
      ) : null}
    </div>
  );
}
