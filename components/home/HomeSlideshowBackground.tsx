"use client";

import { useEffect, useState } from "react";
import type { HomeSlide } from "../../lib/sanity/types";

const slideDuration = 5600;
const fallbackSlides: HomeSlide[] = [
  { id: "home-slide-1", src: "/1.jpg" },
  { id: "home-slide-2", src: "/2.jpg" },
  { id: "home-slide-3", src: "/3.jpg" },
  { id: "home-slide-4", src: "/4.jpg" },
  { id: "home-slide-5", src: "/5.jpg" },
];

type HomeSlideshowBackgroundProps = {
  dimmed?: boolean;
  slides?: HomeSlide[];
};

export default function HomeSlideshowBackground({
  dimmed = false,
  slides = fallbackSlides,
  }: HomeSlideshowBackgroundProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slideCount = slides.length;
  const displayedActiveIndex = slideCount > 0 ? activeIndex % slideCount : 0;

  useEffect(() => {
    if (slideCount <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slideCount);
    }, slideDuration);

    return () => window.clearInterval(interval);
  }, [slideCount]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={[
            "absolute inset-0 bg-cover bg-center transition-opacity duration-[1600ms] ease-out",
            index === displayedActiveIndex ? (dimmed ? "opacity-45" : "opacity-100") : "opacity-0",
          ].join(" ")}
          style={{ backgroundImage: `url(${slide.src})` }}
        />
      ))}

      <div
        className={[
          "absolute inset-0 bg-[#050505] transition-opacity duration-500",
          dimmed ? "opacity-45" : "opacity-0",
        ].join(" ")}
      />
    </div>
  );
}
