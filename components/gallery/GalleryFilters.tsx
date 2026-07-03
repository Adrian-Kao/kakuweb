"use client";

import { useEffect, useMemo, useState } from "react";
import type { Category, GalleryCategoryId, Series } from "../../data/gallery";

type ExpandedPanel = "categories" | "series";

type GalleryFiltersProps = {
  activeCategory: GalleryCategoryId | "all";
  activeSeriesTitle?: string;
  activeSeriesSlug?: string;
  categories: Category[];
  series: Series[];
  onCategoryChange: (category: GalleryCategoryId | "all") => void;
  onSeriesSelect: (seriesSlug: string) => void;
};

export default function GalleryFilters({
  activeCategory,
  activeSeriesSlug,
  categories,
  series,
  onCategoryChange,
  onSeriesSelect,
}: GalleryFiltersProps) {
  const [expandedPanel, setExpandedPanel] = useState<ExpandedPanel>("series");

  const effectiveCategoryId =
    activeCategory === "all" ? categories[0]?.id : activeCategory;

  useEffect(() => {
    if (activeCategory === "all" && categories[0]?.id) {
      onCategoryChange(categories[0].id);
      setExpandedPanel("series");
    }
  }, [activeCategory, categories, onCategoryChange]);

  const visibleSeries = useMemo(() => {
    if (!effectiveCategoryId) {
      return [];
    }

    return series.filter((item) => item.categoryId === effectiveCategoryId);
  }, [effectiveCategoryId, series]);

  const activeCategoryLabel =
    categories.find((category) => category.id === effectiveCategoryId)?.label ??
    "請選擇作品分類";

  const isCategoriesOpen = expandedPanel === "categories";
  const isSeriesOpen = expandedPanel === "series";

  function handleCategorySelect(categoryId: GalleryCategoryId) {
    onCategoryChange(categoryId);
    setExpandedPanel("series");
  }

  function handleSeriesSelect(seriesSlug: string) {
    onSeriesSelect(seriesSlug);
  }

  return (
    <aside className="relative z-10 flex min-h-[38vh] flex-col lg:min-h-0">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.42em] text-[#c9a46a]">
          KAKU PHOTOGRAPHY
        </p>

        <h1 className="mt-14 text-5xl font-light uppercase leading-none tracking-[0.08em] text-[#f3eee6] sm:text-6xl">
          Gallery
        </h1>
      </div>

      <div className="mt-8 max-w-xs">
        <button
          type="button"
          aria-expanded={isCategoriesOpen}
          onClick={() => setExpandedPanel("categories")}
          className={[
            "flex w-full items-center justify-between border-b py-3 text-left text-xs uppercase tracking-[0.32em] transition duration-300",
            isCategoriesOpen
              ? "border-[#c9a46a] text-[#c9a46a]"
              : "border-white/10 text-[rgba(243,238,230,0.48)] hover:text-[#f3eee6]",
          ].join(" ")}
        >
          <span>作品分類</span>
          <span className="text-[0.65rem]">
            {isCategoriesOpen ? "－" : "＋"}
          </span>
        </button>

        {!isCategoriesOpen ? (
          <p className="mt-3 text-[0.68rem] uppercase tracking-[0.18em] text-[rgba(243,238,230,0.42)]">
            {activeCategoryLabel}
          </p>
        ) : null}

        {isCategoriesOpen ? (
          <nav
            aria-label="Gallery categories"
            className="scrollbar-hidden mt-4 flex max-h-[24vh] flex-col gap-2 overflow-y-auto pr-2"
          >
            {categories.map((category, index) => {
              const isActive = effectiveCategoryId === category.id;

              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => handleCategorySelect(category.id)}
                  className={[
                    "border-b py-3 text-left text-xs uppercase tracking-[0.22em] transition duration-300",
                    isActive
                      ? "border-[#c9a46a] text-[#c9a46a]"
                      : "border-white/10 text-[rgba(243,238,230,0.48)] hover:text-[#f3eee6]",
                  ].join(" ")}
                >
                  {String(index + 1).padStart(2, "0")} — {category.label}
                </button>
              );
            })}
          </nav>
        ) : null}
      </div>

      <div className="mt-7 max-w-xs">
        <button
          type="button"
          aria-expanded={isSeriesOpen}
          onClick={() => setExpandedPanel("series")}
          className={[
            "flex w-full items-center justify-between border-b py-3 text-left text-xs uppercase tracking-[0.32em] transition duration-300",
            isSeriesOpen
              ? "border-[#c9a46a] text-[#c9a46a]"
              : "border-white/10 text-[rgba(243,238,230,0.48)] hover:text-[#f3eee6]",
          ].join(" ")}
        >
          <span>作品集</span>
          <span className="text-[0.65rem]">
            {isSeriesOpen ? "－" : "＋"}
          </span>
        </button>

        {!isSeriesOpen ? (
          <p className="mt-3 text-[0.68rem] uppercase tracking-[0.18em] text-[rgba(243,238,230,0.42)]">
            {activeCategoryLabel} 的作品集
          </p>
        ) : null}

        {isSeriesOpen ? (
          <nav
            aria-label="Gallery series"
            className="scrollbar-hidden mt-4 flex max-h-[26vh] flex-col gap-2 overflow-y-auto pr-2"
          >
            {visibleSeries.length > 0 ? (
              visibleSeries.map((item, index) => {
                const isActive = activeSeriesSlug === item.slug;

                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => handleSeriesSelect(item.slug)}
                    className={[
                      "border-b py-2 text-left text-[0.68rem] uppercase tracking-[0.2em] transition duration-300",
                      isActive
                        ? "border-[#c9a46a] text-[#c9a46a]"
                        : "border-white/10 text-[rgba(243,238,230,0.45)] hover:text-[#f3eee6]",
                    ].join(" ")}
                  >
                    {String(index + 1).padStart(2, "0")} {item.title}
                  </button>
                );
              })
            ) : (
              <p className="py-4 text-[0.68rem] uppercase tracking-[0.18em] text-[rgba(243,238,230,0.38)]">
                此分類尚無作品集
              </p>
            )}
          </nav>
        ) : null}
      </div>
    </aside>
  );
}