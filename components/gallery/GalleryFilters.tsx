"use client";

import { useEffect } from "react";
import type { Category, GalleryCategoryId } from "../../data/gallery";

// Frontend typography/color settings: Works sidebar labels, active colors, and text sizing are controlled by className strings below.
type GalleryFiltersProps = {
  activeCategory: GalleryCategoryId | "all";
  activeSeriesSlug?: string;
  categories: Category[];
  onCategoryChange: (category: GalleryCategoryId | "all") => void;
};

export default function GalleryFilters({
  activeCategory,
  activeSeriesSlug,
  categories,
  onCategoryChange,
}: GalleryFiltersProps) {
  const effectiveCategoryId =
    activeCategory === "all" ? categories[0]?.id : activeCategory;

  useEffect(() => {
    if (activeSeriesSlug) {
      return;
    }

    if (activeCategory === "all" && categories[0]?.id) {
      onCategoryChange(categories[0].id);
    }
  }, [activeCategory, activeSeriesSlug, categories, onCategoryChange]);

  return (
    <aside className="relative z-10 flex min-h-[38vh] flex-col lg:min-h-0">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.42em] text-[#c9a46a]">
          KAKU PHOTOGRAPHY
        </p>

        <h1 className="mt-14 text-5xl font-light uppercase leading-none tracking-[0.08em] text-[#f3eee6] sm:text-6xl">
          Works
        </h1>
      </div>

      <nav
        aria-label="Works categories"
        className="scrollbar-hidden mt-14 flex max-h-[32vh] max-w-xs flex-col gap-2 overflow-y-auto pr-2"
      >
        {categories.map((category) => {
          const isActive = effectiveCategoryId === category.id;

          return (
            <button
              key={category.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onCategoryChange(category.id)}
              className={[
                "border-b py-3 text-left text-xs uppercase tracking-[0.22em] transition duration-300",
                isActive
                  ? "border-[#c9a46a] text-[#c9a46a]"
                  : "border-white/10 text-[rgba(243,238,230,0.48)] hover:text-[#f3eee6]",
              ].join(" ")}
            >
              {category.shortLabel}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
