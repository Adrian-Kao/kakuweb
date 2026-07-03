"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { GalleryPhoto } from "../../data/gallery";
import type { GalleryData } from "../../lib/sanity/data";
import MobileShell from "../mobile/MobileShell";

const P5Sketch = dynamic(() => import("../P5Sketch"), {
  ssr: false,
});

type MobileGalleryProps = {
  forcedSeriesSlug?: string;
  data: GalleryData;
};

function scrollToSeries(slug: string) {
  document.getElementById(`series-${slug}`)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function getCategoryScope(categoryId: string | null, categories: GalleryData["categories"]) {
  if (!categoryId) {
    return null;
  }

  return new Set([
    categoryId,
    ...categories
      .filter((category) => category.parentId === categoryId)
      .map((category) => category.id),
  ]);
}

export default function MobileGallery({ forcedSeriesSlug, data }: MobileGalleryProps) {
  const searchParams = useSearchParams();
  const { categories, series, photos } = data;
  const seriesSlug = forcedSeriesSlug ?? searchParams.get("series");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const activeCategoryFromSlug = categories.find(
    (category) => category.id === `category-${seriesSlug}`,
  );
  const effectiveCategoryId = activeCategoryFromSlug?.id ?? activeCategoryId;

  const visibleSeries = useMemo(() => {
    const categoryScope = getCategoryScope(effectiveCategoryId, categories);

    if (!categoryScope) {
      return series;
    }

    return series.filter((item) => categoryScope.has(item.categoryId));
  }, [categories, effectiveCategoryId, series]);

  useEffect(() => {
    if (!seriesSlug) {
      return;
    }

    if (activeCategoryFromSlug) {
      return;
    }

    const frame = requestAnimationFrame(() => scrollToSeries(seriesSlug));

    return () => cancelAnimationFrame(frame);
  }, [activeCategoryFromSlug, seriesSlug]);

  return (
    <MobileShell>
      <div className="relative min-h-screen bg-[#050505] px-6 py-8 text-[#f3eee6]">
        <P5Sketch intensity="low" />

        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.42em] text-[#c9a46a]">
            KAKU PHOTOGRAPHY
          </p>
          <h1 className="mt-5 text-5xl font-light uppercase tracking-[0.08em]">
            Gallery
          </h1>
          <p className="mt-7 text-sm leading-7 text-[rgba(243,238,230,0.62)]">
            A moving archive of light, shadow, and memory.
          </p>

          <div className="scrollbar-hidden sticky top-0 z-20 -mx-6 mt-10 flex gap-3 overflow-x-auto border-y border-white/10 bg-[#050505]/88 px-6 py-4 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setActiveCategoryId(null)}
              className={[
                "shrink-0 text-[0.68rem] uppercase tracking-[0.22em] transition",
                effectiveCategoryId
                  ? "text-[rgba(243,238,230,0.52)]"
                  : "text-[#c9a46a]",
              ].join(" ")}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategoryId(category.id)}
                className={[
                  "shrink-0 text-[0.68rem] uppercase tracking-[0.22em] transition",
                  effectiveCategoryId === category.id
                    ? "text-[#c9a46a]"
                    : "text-[rgba(243,238,230,0.52)]",
                ].join(" ")}
              >
                {category.shortLabel}
              </button>
            ))}
          </div>

          <div className="scrollbar-hidden -mx-6 flex gap-3 overflow-x-auto px-6 py-5">
            {visibleSeries.map((series, index) => (
              <button
                key={series.id}
                type="button"
                onClick={() => scrollToSeries(series.slug)}
                className="shrink-0 border border-white/10 px-4 py-3 text-left text-[0.68rem] uppercase tracking-[0.2em] text-[rgba(243,238,230,0.62)] transition hover:border-[#c9a46a]/70 hover:text-[#f3eee6]"
              >
                {String(index + 1).padStart(2, "0")} \u2014 {series.title}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-16">
            {visibleSeries.map((series, index) => {
              const seriesPhotos = photos.filter(
                (photo) => photo.seriesId === series.id,
              );

              return (
                <section
                  key={series.id}
                  id={`series-${series.slug}`}
                  className="scroll-mt-28 border-t border-white/10 pt-8"
                >
                  <p className="text-xs uppercase tracking-[0.28em] text-[#c9a46a]">
                    Series {String(index + 1).padStart(2, "0")}
                  </p>
                  <h2 className="mt-4 text-3xl font-light uppercase tracking-[0.08em]">
                    {series.title}
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-[rgba(243,238,230,0.6)]">
                    {series.description}
                  </p>

                  <div className="mt-8 space-y-9">
                    {seriesPhotos.map((photo) => (
                      <MobileGalleryPhoto
                        key={photo.id}
                        photo={photo}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

      </div>
    </MobileShell>
  );
}

function MobileGalleryPhoto({
  photo,
}: {
  photo: GalleryPhoto;
}) {
  return (
    <article className="block w-full text-left">
      <div
        className="relative overflow-hidden border border-white/10 bg-[#111]"
        style={{ aspectRatio: photo.aspectRatio }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${photo.imageUrl})` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(243,238,230,0.14),rgba(243,238,230,0.02)_40%,rgba(0,0,0,0.5)),radial-gradient(circle_at_54%_32%,rgba(201,164,106,0.18),transparent_36%)]" />
      </div>
      <div className="mt-4 border-t border-white/10 pt-4">
        <p className="text-xs uppercase tracking-[0.22em]">{photo.title}</p>
        <p className="mt-2 text-[0.68rem] uppercase tracking-[0.18em] text-[rgba(243,238,230,0.48)]">
          {photo.year} / {photo.categoryName} / {photo.seriesTitle}
        </p>
      </div>
    </article>
  );
}
