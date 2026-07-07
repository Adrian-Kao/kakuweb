"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  type GalleryCategoryId,
  type GalleryPhoto,
  type Series,
} from "../../data/gallery";
import type { GalleryData } from "../../lib/sanity/data";
import PortfolioNavigation from "../PortfolioNavigation";
import PhotoViewerOverlay from "../photo/PhotoViewerOverlay";
import GalleryFilters from "./GalleryFilters";

// Frontend typography/color settings: Gallery layout text, accent, border, and background classes are in className strings below.
type GalleryGridProps = {
  forcedSeriesSlug?: string;
  data: GalleryData;
};

function getSeriesCoverPhoto(series: Series, photos: GalleryPhoto[]) {
  return (
    photos.find((photo) => photo.id === series.coverPhotoId) ??
    photos.find((photo) => photo.seriesId === series.id) ??
    null
  );
}

function getCategoryScope(
  categoryId: GalleryCategoryId | "all",
  categories: GalleryData["categories"],
) {
  if (categoryId === "all") {
    return null;
  }

  return new Set([
    categoryId,
    ...categories
      .filter((category) => category.parentId === categoryId)
      .map((category) => category.id),
  ]);
}

export default function GalleryGrid({ forcedSeriesSlug, data }: GalleryGridProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { categories, series, photos } = data;
  const querySeriesSlug = searchParams.get("series");
  const seriesSlug = forcedSeriesSlug ?? querySeriesSlug;
  const [activeCategory, setActiveCategory] =
    useState<GalleryCategoryId | "all">("all");
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

  const activeSeries = series.find((item) => item.slug === seriesSlug);
  const activeCategoryFromSlug = categories.find(
    (category) => category.id === (`category-${seriesSlug}` as GalleryCategoryId),
  );
  const isSeriesDetail = Boolean(activeSeries);
  const effectiveCategory = activeSeries
    ? "all"
    : activeCategoryFromSlug?.id ?? activeCategory;

  const visibleSeries = useMemo(() => {
    const categoryScope = getCategoryScope(effectiveCategory, categories);

    return series.filter((item) => {
      if (!categoryScope) {
        return true;
      }

      return categoryScope.has(item.categoryId);
    });
  }, [categories, effectiveCategory, series]);

  const visiblePhotos = useMemo(() => {
    const categoryScope = getCategoryScope(effectiveCategory, categories);

    return photos.filter((photo) => {
      if (activeSeries && photo.seriesSlug !== activeSeries.slug) {
        return false;
      }

      if (!activeSeries && categoryScope && !categoryScope.has(photo.categoryId)) {
        return false;
      }

      return true;
    });
  }, [categories, effectiveCategory, activeSeries, photos]);

  const selectedIndex = selectedPhotoId
    ? visiblePhotos.findIndex((photo) => photo.id === selectedPhotoId)
    : -1;
  const selectedPhoto = selectedIndex >= 0 ? visiblePhotos[selectedIndex] : null;

  const moveViewer = (step: number) => {
    if (selectedIndex < 0 || visiblePhotos.length === 0) {
      return;
    }

    const nextIndex =
      (selectedIndex + step + visiblePhotos.length) % visiblePhotos.length;
    setSelectedPhotoId(visiblePhotos[nextIndex].id);
  };

  return (
    <div className="relative h-screen overflow-hidden bg-[#050505] text-[#f3eee6]">
      <main className="relative z-10 grid h-screen grid-cols-1 gap-14 overflow-hidden px-7 py-8 sm:px-12 lg:grid-cols-[26%_74%] lg:px-20 lg:py-12">
        <div className="flex h-[calc(100vh-4rem)] flex-col justify-between lg:h-[calc(100vh-6rem)]">
          <GalleryFilters
            activeCategory={effectiveCategory}
            activeSeriesTitle={activeSeries?.title}
            activeSeriesSlug={activeSeries?.slug}
            categories={categories}
            series={series}
            onCategoryChange={(category) => {
              setActiveCategory(category);
              setSelectedPhotoId(null);

              if (category === "all") {
                router.push("/gallery");
                return;
              }

              router.push(`/gallery/${category.replace(/^category-/, "")}`);
            }}
            onSeriesSelect={(slug) => {
              setSelectedPhotoId(null);
              router.push(`/gallery/${slug}`);
            }}
          />
          <PortfolioNavigation className="mt-14" />
        </div>

        <section className="scrollbar-hidden h-[calc(100vh-4rem)] overflow-y-auto overscroll-contain pb-20 pr-0 lg:h-[calc(100vh-6rem)] lg:pr-3">
          <div className="mb-14 flex items-end justify-between gap-8 border-b border-white/10 pb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-[#c9a46a]">
                {isSeriesDetail ? "Series Archive" : "Series Index"}
              </p>
              
              {isSeriesDetail ? (
                <button
                  type="button"
                  onClick={() => router.push("/gallery")}
                  className="mt-5 border-b border-[#c9a46a] pb-2 text-xs uppercase tracking-[0.24em] text-[#c9a46a] transition hover:text-[#f3eee6]"
                >
                  Back to Series
                </button>
              ) : null}
            </div>
            <p className="hidden text-xs uppercase tracking-[0.24em] text-[rgba(243,238,230,0.42)] sm:block">
              {isSeriesDetail
                ? `${visiblePhotos.length} Frames`
                : `${visibleSeries.length} Series`}
            </p>
          </div>

          {isSeriesDetail ? (
            <div className="grid grid-cols-1 gap-x-10 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
              {visiblePhotos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setSelectedPhotoId(photo.id)}
                  className="group block w-full text-left"
                >
                  <div
                    className="relative overflow-hidden border border-white/10 bg-[#111] transition duration-500 group-hover:brightness-110"
                    style={{ aspectRatio: photo.aspectRatio }}
                  >
                    <div
                      className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                      style={{ backgroundImage: `url(${photo.imageUrl})` }}
                    />
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-4 border-t border-white/10 pt-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-[#f3eee6]">
                        {photo.title}
                      </p>
                      <p className="mt-2 text-[0.68rem] uppercase tracking-[0.18em] text-[rgba(243,238,230,0.46)]">
                        {photo.categoryName} / {photo.collaborator}
                      </p>
                    </div>
                    <p className="text-[0.68rem] uppercase tracking-[0.18em] text-[#c9a46a]">
                      {photo.year}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-12 gap-y-16 md:grid-cols-2 xl:grid-cols-3">
              {visibleSeries.map((series, index) => {
                const coverPhoto = getSeriesCoverPhoto(series, photos);
                const category = categories.find(
                  (item) => item.id === series.categoryId,
                );

                return (
                  <button
                    key={series.id}
                    type="button"
                    onClick={() => router.push(`/gallery/${series.slug}`)}
                    className="group block w-full text-left"
                  >
                    <div
                      className="relative overflow-hidden border border-white/10 bg-[#111] transition duration-500 group-hover:brightness-110"
                      style={{ aspectRatio: "4 / 5" }}
                    >
                      <div
                        className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                        style={{
                          backgroundImage: `url(${coverPhoto?.imageUrl ?? "/1.jpg"})`,
                        }}
                      />
                      <div className="absolute left-5 top-5 text-[0.62rem] uppercase tracking-[0.24em] text-[rgba(243,238,230,0.58)]">
                        Series {String(index + 1).padStart(2, "0")}
                      </div>
                    </div>
                    <div className="mt-5 border-t border-white/10 pt-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-[#f3eee6]">
                        {series.title}
                      </p>
                      <p className="mt-2 text-[0.68rem] uppercase tracking-[0.18em] text-[#c9a46a]">
                        {category?.name ?? "Category"} / Open Series
                      </p>
                      <p className="mt-4 max-w-sm text-sm leading-6 text-[rgba(243,238,230,0.5)]">
                        {series.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {selectedPhoto ? (
        <PhotoViewerOverlay
          photo={selectedPhoto}
          onClose={() => setSelectedPhotoId(null)}
          onNext={() => moveViewer(1)}
          onPrevious={() => moveViewer(-1)}
        />
      ) : null}
    </div>
  );
}
