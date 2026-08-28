"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { GalleryPhoto } from "../../data/gallery";
import type { Series } from "../../data/gallery";
import type { GalleryData } from "../../lib/sanity/data";
import MobileShell from "../mobile/MobileShell";

// Frontend typography/color settings: mobile Gallery text, accent, background, and card colors are controlled by Tailwind classes below.
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

function getCategorySlug(categoryId: string) {
  return categoryId.replace(/^category-/, "");
}

function getSeriesCoverPhoto(series: Series, photos: GalleryPhoto[]) {
  return (
    photos.find((photo) => photo.id === series.coverPhotoId) ??
    photos.find((photo) => photo.seriesId === series.id) ??
    null
  );
}

export default function MobileGallery({ forcedSeriesSlug, data }: MobileGalleryProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { categories, series, photos } = data;
  const seriesSlug = forcedSeriesSlug ?? searchParams.get("series");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const activeSeries = series.find((item) => item.slug === seriesSlug);
  const activeCategoryFromSlug = categories.find(
    (category) => category.id === `category-${seriesSlug}`,
  );
  const effectiveCategoryId = activeCategoryFromSlug?.id ?? activeCategoryId;

  const visibleSeries = useMemo(() => {
    if (activeSeries) {
      return [activeSeries];
    }

    const categoryScope = getCategoryScope(effectiveCategoryId, categories);

    if (!categoryScope) {
      return series;
    }

    return series.filter((item) => categoryScope.has(item.categoryId));
  }, [activeSeries, categories, effectiveCategoryId, series]);

  useEffect(() => {
    if (!seriesSlug || activeSeries) {
      return;
    }

    if (activeCategoryFromSlug) {
      return;
    }

    const frame = requestAnimationFrame(() => scrollToSeries(seriesSlug));

    return () => cancelAnimationFrame(frame);
  }, [activeCategoryFromSlug, activeSeries, seriesSlug]);

  return (
    <MobileShell>
      <div className="relative min-h-screen bg-[#050505] px-6 py-8 text-[#f3eee6]">
        <div className="relative z-10">

          <h1 className="mt-5 text-5xl font-light uppercase tracking-[0.08em]">
            Works
          </h1>

          <div className="scrollbar-hidden sticky top-0 z-20 -mx-6 mt-10 flex gap-3 overflow-x-auto border-y border-white/10 bg-[#050505]/88 px-6 py-4 backdrop-blur-md">
            <button
              type="button"
              onClick={() => {
                setActiveCategoryId(null);
                router.push("/gallery");
              }}
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
                onClick={() => {
                  setActiveCategoryId(category.id);
                  router.push(`/gallery/${getCategorySlug(category.id)}`);
                }}
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

          {activeSeries ? (
            <button
              type="button"
              onClick={() => router.push("/gallery")}
              className="mt-3 border-b border-[#c9a46a] pb-2 text-[0.68rem] uppercase tracking-[0.24em] text-[#c9a46a]"
            >
              返回作品集
            </button>
          ) : null}

          <div className="mt-8">
            {activeSeries ? (
              <MobileSeriesPhotos
                photos={photos.filter((photo) => photo.seriesId === activeSeries.id)}
                seriesTitle={activeSeries.title}
              />
            ) : (
              <MobileSeriesIndex photos={photos} series={visibleSeries} />
            )}
          </div>
        </div>

      </div>
    </MobileShell>
  );
}

function MobileSeriesIndex({
  photos,
  series,
}: {
  photos: GalleryPhoto[];
  series: Series[];
}) {
  const router = useRouter();

  return (
    <div className="space-y-12">
      {series.map((item) => {
        const coverPhoto = getSeriesCoverPhoto(item, photos);

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => router.push(`/gallery/${item.slug}`)}
            className="group block w-full text-left"
          >
            <img
              src={coverPhoto?.imageUrl ?? "/1.jpg"}
              alt={coverPhoto?.alt ?? item.title}
              className="block h-auto w-full transition duration-500 group-hover:brightness-110"
              loading="lazy"
            />
            <div className="mt-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[#f3eee6]">
                {item.title}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function MobileSeriesPhotos({
  photos,
  seriesTitle,
}: {
  photos: GalleryPhoto[];
  seriesTitle: string;
}) {
  return (
    <section className="scroll-mt-28">
      <h2 className="text-3xl font-light uppercase tracking-[0.08em]">
        {seriesTitle}
      </h2>

      <div className="mt-8 space-y-9">
        {photos.map((photo) => (
          <MobileGalleryPhoto key={photo.id} photo={photo} />
        ))}
      </div>
    </section>
  );
}

function MobileGalleryPhoto({
  photo,
}: {
  photo: GalleryPhoto;
}) {
  return (
    <article className="block w-full text-left">
      <img
        src={photo.imageUrl}
        alt={photo.alt}
        className="block h-auto w-full"
        loading="lazy"
      />
      <div className="mt-4">
        <p className="text-xs uppercase tracking-[0.22em]">{photo.title}</p>
      </div>
    </article>
  );
}
