"use client";

import { useEffect, useMemo, useState } from "react";
import type { HomeSlide } from "../../lib/sanity/types";

const slideDuration = 5600;

type HomeSlideshowBackgroundProps = {
  dimmed?: boolean;
  slides?: HomeSlide[];
};

function getCropBackgroundStyle(slide: HomeSlide) {
  if (!slide.crop) {
    return {
      backgroundImage: `url(${slide.src})`,
    };
  }

  const maxX = Math.max(100 - slide.crop.width, 1);
  const maxY = Math.max(100 - slide.crop.height, 1);

  return {
    backgroundImage: `url(${slide.src})`,
    backgroundPosition: `${(slide.crop.x / maxX) * 100}% ${(slide.crop.y / maxY) * 100}%`,
    backgroundRepeat: "no-repeat",
    backgroundSize: `${10000 / slide.crop.width}% auto`,
  };
}

export default function HomeSlideshowBackground({
  dimmed = false,
  slides = [],
}: HomeSlideshowBackgroundProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const validSlides = useMemo(
    () => slides.filter((slide) => slide.src),
    [slides],
  );
  const slideCount = validSlides.length;
  const displayedActiveIndex = slideCount > 0 ? activeIndex % slideCount : 0;
  const slideSignature = validSlides.map((slide) => slide.id).join("|");

  useEffect(() => {
    const timeout = window.setTimeout(() => setActiveIndex(0), 0);

    return () => window.clearTimeout(timeout);
  }, [slideSignature]);

  useEffect(() => {
    if (slideCount === 0) {
      return;
    }

    const nextSlide = validSlides[(displayedActiveIndex + 1) % slideCount];

    if (!nextSlide?.src) {
      return;
    }

    const image = new Image();
    image.decoding = "async";
    image.src = nextSlide.src;
  }, [displayedActiveIndex, slideCount, validSlides]);

  useEffect(() => {
    if (slideCount <= 1) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % slideCount);
    }, slideDuration);

    return () => window.clearTimeout(timeout);
  }, [activeIndex, slideCount]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {validSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={[
            "absolute inset-0 bg-cover bg-center transition-opacity duration-[1600ms] ease-out",
            index === displayedActiveIndex ? (dimmed ? "opacity-45" : "opacity-100") : "opacity-0",
          ].join(" ")}
          style={getCropBackgroundStyle(slide)}
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
