"use client";

import { useMemo, useState } from "react";
import { usePageTransition } from "../PageTransition";
import PhotoViewerOverlay from "../photo/PhotoViewerOverlay";
import { featuredHomePhotos, type GalleryPhoto } from "../../data/gallery";
import FilmStrip from "./FilmStrip";

export default function HomeFilmStrips() {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const { transitionTo } = usePageTransition();

  const [leftPhotos, rightPhotos] = useMemo(() => {
    const left: GalleryPhoto[] = [];
    const right: GalleryPhoto[] = [];

    featuredHomePhotos.forEach((photo, index) => {
      if (index % 2 === 0) {
        left.push(photo);
        return;
      }

      right.push(photo);
    });

    return [left, right];
  }, []);

  return (
    <section className="relative grid h-screen grid-cols-1 gap-10 overflow-hidden lg:grid-cols-2">
      <FilmStrip
        photos={leftPhotos}
        direction="up"
        onSelect={setSelectedPhoto}
        dimmed={Boolean(selectedPhoto)}
      />
      <FilmStrip
        photos={rightPhotos}
        direction="down"
        onSelect={setSelectedPhoto}
        dimmed={Boolean(selectedPhoto)}
      />

      {selectedPhoto ? (
        <PhotoViewerOverlay
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onGoToGallery={(photo) =>
            transitionTo(`/gallery/${photo.seriesSlug}`)
          }
        />
      ) : null}
    </section>
  );
}
