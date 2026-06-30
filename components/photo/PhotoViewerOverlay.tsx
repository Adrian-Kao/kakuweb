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
        className="grid max-h-[90vh] w-full max-w-6xl grid-cols-1 items-end gap-7 lg:grid-cols-[minmax(0,1fr)_20rem]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative mx-auto flex max-h-[72vh] w-full max-w-full items-center justify-center lg:max-h-[80vh] lg:max-w-[70vw]">
          <div
            className="relative w-full animate-[galleryFocus_360ms_ease-out] overflow-hidden border border-white/10 bg-[#120f0d] shadow-[0_50px_160px_rgba(0,0,0,0.72)]"
            style={{ aspectRatio: photo.aspectRatio }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${photo.imageUrl})` }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(243,238,230,0.18),rgba(243,238,230,0.03)_42%,rgba(0,0,0,0.48)),radial-gradient(circle_at_58%_34%,rgba(201,164,106,0.25),transparent_38%)]" />
            <div className="absolute inset-0 opacity-[0.12] mix-blend-screen [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.42)_0_1px,transparent_1px)] [background-size:10px_10px]" />
          </div>
        </div>

        <div className="mx-auto w-full max-w-sm lg:mx-0">
          <p className="text-xs uppercase tracking-[0.32em] text-[#c9a46a]">
            {photo.seriesTitle}
          </p>
          <h2 className="mt-5 text-3xl font-light tracking-[0.04em] text-[#f3eee6]">
            {photo.title}
          </h2>
          <p className="mt-4 text-sm leading-7 text-[rgba(243,238,230,0.62)]">
            {photo.description}
          </p>
          <p className="mt-6 text-xs uppercase tracking-[0.24em] text-[rgba(243,238,230,0.44)]">
            {photo.year} / {photo.categoryName}
          </p>

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
