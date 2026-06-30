"use client";

import { useCallback, useEffect, useMemo, useRef, type TouchEvent } from "react";
import type { GalleryPhoto } from "../../data/gallery";
import FilmFrame from "../gallery/FilmFrame";

type FilmStripProps = {
  photos: GalleryPhoto[];
  direction: "up" | "down";
  onSelect: (photo: GalleryPhoto) => void;
  dimmed?: boolean;
  className?: string;
};

const autoSpeed = 15;
const manualResumeDelay = 1000;

function wrapOffset(value: number, height: number) {
  if (height <= 0) {
    return value;
  }

  return ((value % height) + height) % height;
}

export default function FilmStrip({
  photos,
  direction,
  onSelect,
  dimmed = false,
  className = "h-screen",
}: FilmStripProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const groupHeightRef = useRef(0);
  const offsetRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isManualRef = useRef(false);
  const isHoveringRef = useRef(false);
  const touchYRef = useRef<number | null>(null);

  const repeatedPhotos = useMemo(
    () => Array.from({ length: 3 }).flatMap(() => photos),
    [photos],
  );

  const applyTransform = useCallback(() => {
    if (!stripRef.current) {
      return;
    }

    const groupHeight = groupHeightRef.current;
    const transformY =
      direction === "up" ? -offsetRef.current : -groupHeight + offsetRef.current;

    stripRef.current.style.transform = `translate3d(0, ${transformY}px, 0)`;
  }, [direction]);

  useEffect(() => {
    const measure = () => {
      groupHeightRef.current = groupRef.current?.offsetHeight ?? 0;
      applyTransform();
    };

    const measureFrame = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);

    return () => {
      cancelAnimationFrame(measureFrame);
      window.removeEventListener("resize", measure);
    };
  }, [applyTransform, photos]);

  useEffect(() => {
    const tick = (now: number) => {
      const last = lastTimeRef.current ?? now;
      const deltaSeconds = (now - last) / 1000;
      lastTimeRef.current = now;

      if (!isManualRef.current && groupHeightRef.current > 0) {
        const speed = autoSpeed * (isHoveringRef.current ? 0.45 : 1);
        offsetRef.current = wrapOffset(
          offsetRef.current + speed * deltaSeconds,
          groupHeightRef.current,
        );
        applyTransform();
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }

      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
      }
    };
  }, [applyTransform]);

  const takeManualControl = (deltaY: number) => {
    if (groupHeightRef.current <= 0) {
      return;
    }

    isManualRef.current = true;

    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
    }

    const signedDelta = direction === "up" ? deltaY : -deltaY;
    offsetRef.current = wrapOffset(
      offsetRef.current + signedDelta,
      groupHeightRef.current,
    );
    applyTransform();

    resumeTimerRef.current = setTimeout(() => {
      isManualRef.current = false;
      lastTimeRef.current = null;
    }, manualResumeDelay);
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    const currentY = event.touches[0]?.clientY;

    if (currentY === undefined || touchYRef.current === null) {
      touchYRef.current = currentY ?? null;
      return;
    }

    const delta = touchYRef.current - currentY;
    touchYRef.current = currentY;
    takeManualControl(delta);
  };

  return (
    <div
      className={[
        "relative overflow-hidden overscroll-contain py-12 transition duration-500",
        className,
        dimmed ? "opacity-20 blur-sm" : "opacity-100",
      ].join(" ")}
      onWheel={(event) => {
        event.preventDefault();
        takeManualControl(event.deltaY);
      }}
      onMouseEnter={() => {
        isHoveringRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveringRef.current = false;
      }}
      onTouchStart={(event) => {
        touchYRef.current = event.touches[0]?.clientY ?? null;
      }}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => {
        touchYRef.current = null;
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-[#050505] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-[#050505] to-transparent" />
      <div
        ref={stripRef}
        className="flex flex-col gap-7 will-change-transform"
      >
        <div ref={groupRef} className="flex flex-col gap-7">
          {photos.map((photo) => (
            <FilmFrame key={photo.id} photo={photo} onSelect={onSelect} />
          ))}
        </div>
        {repeatedPhotos.map((photo, index) => (
          <FilmFrame
            key={`${photo.id}-repeat-${index}`}
            photo={photo}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
