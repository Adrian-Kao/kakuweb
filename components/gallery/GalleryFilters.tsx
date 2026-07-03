"use client";

import type { Category, GalleryCategoryId, Series } from "../../data/gallery";

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
  activeSeriesTitle,
  activeSeriesSlug,
  categories,
  series,
  onCategoryChange,
  onSeriesSelect,
}: GalleryFiltersProps) {
  return (
    <aside className="relative z-10 flex min-h-[38vh] flex-col lg:min-h-0">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.42em] text-[#c9a46a]">
          KAKU PHOTOGRAPHY
        </p>
        <h1 className="mt-14 text-5xl font-light uppercase leading-none tracking-[0.08em] text-[#f3eee6] sm:text-6xl">
          Gallery
        </h1>
        <p className="mt-8 max-w-xs text-base leading-7 text-[rgba(243,238,230,0.62)]">
          {activeSeriesTitle
            ? `Selected series: ${activeSeriesTitle}.`
            : "An editorial archive of light, shadow, and memory."}
        </p>
      </div>

      <nav
        aria-label="Gallery categories"
        className="scrollbar-hidden mt-8 flex max-h-[18vh] max-w-xs flex-col gap-2 overflow-y-auto pr-2"
      >
        <button
          type="button"
          aria-pressed={activeCategory === "all"}
          onClick={() => onCategoryChange("all")}
          className={[
            "border-b py-3 text-left text-xs uppercase tracking-[0.22em] transition duration-300",
            activeCategory === "all"
              ? "border-[#c9a46a] text-[#c9a46a]"
              : "border-white/10 text-[rgba(243,238,230,0.48)] hover:text-[#f3eee6]",
          ].join(" ")}
        >
           All Work
        </button>
        {categories.map((category) => {
          const isActive = activeCategory === category.id;

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
              {category.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-7 max-w-xs">
        <p className="mb-4 text-xs uppercase tracking-[0.32em] text-[#c9a46a]">
          作品集
        </p>
        <nav
          aria-label="Gallery series"
          className="scrollbar-hidden flex max-h-[18vh] flex-col gap-2 overflow-y-auto pr-2"
        >
          {series.map((item, index) => {
            const isActive = activeSeriesSlug === item.slug;

            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => onSeriesSelect(item.slug)}
                className={[
                  "border-b py-2 text-left text-[0.68rem] uppercase tracking-[0.2em] transition duration-300",
                  isActive
                    ? "border-[#c9a46a] text-[#c9a46a]"
                    : "border-white/10 text-[rgba(243,238,230,0.45)] hover:text-[#f3eee6]",
                ].join(" ")}
              >
                {String(index + 1).padStart(2, "0")} \u2014 {item.title}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
