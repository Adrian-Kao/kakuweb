"use client";

import { useEffect, useRef } from "react";
import type p5 from "p5";

type P5SketchProps = {
  intensity?: "default" | "low";
};

export default function P5Sketch({ intensity = "default" }: P5SketchProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);
  const isLowIntensity = intensity === "low";

  useEffect(() => {
    let isMounted = true;
    let handlePointerMove: ((event: PointerEvent) => void) | null = null;

    async function loadSketch() {
      const p5Module = await import("p5");
      const P5 = p5Module.default;

      if (!isMounted || !containerRef.current || p5InstanceRef.current) {
        return;
      }

      p5InstanceRef.current = new P5((p: p5) => {
        const spotlight = {
          x: 0,
          y: 0,
          targetX: 0,
          targetY: 0,
        };

        const setSpotlightTarget = (x: number, y: number) => {
          spotlight.targetX = x;
          spotlight.targetY = y;
        };

        p.setup = () => {
          p.createCanvas(p.windowWidth, p.windowHeight);
          p.pixelDensity(Math.min(window.devicePixelRatio, 2));
          p.frameRate(isLowIntensity ? 18 : 30);
          p.noStroke();

          spotlight.x = p.width * 0.58;
          spotlight.y = p.height * 0.42;
          setSpotlightTarget(spotlight.x, spotlight.y);

          handlePointerMove = (event: PointerEvent) => {
            setSpotlightTarget(event.clientX, event.clientY);
          };

          window.addEventListener("pointermove", handlePointerMove);
        };

        p.draw = () => {
          p.clear();

          spotlight.x = spotlight.targetX;
          spotlight.y = spotlight.targetY;

          const ctx = p.drawingContext as CanvasRenderingContext2D;
          const radius = isLowIntensity
            ? p.constrain(Math.min(p.width, p.height) * 0.34, 180, 280)
            : p.constrain(Math.min(p.width, p.height) * 0.42, 280, 420);
          const gradient = ctx.createRadialGradient(
            spotlight.x,
            spotlight.y,
            0,
            spotlight.x,
            spotlight.y,
            radius,
          );

          gradient.addColorStop(
            0,
            isLowIntensity
              ? "rgba(244, 240, 232, 0.15)"
              : "rgba(244, 240, 232, 0.24)",
          );
          gradient.addColorStop(
            0.36,
            isLowIntensity
              ? "rgba(216, 177, 111, 0.05)"
              : "rgba(216, 177, 111, 0.09)",
          );
          gradient.addColorStop(
            0.72,
            isLowIntensity
              ? "rgba(244, 240, 232, 0.02)"
              : "rgba(244, 240, 232, 0.03)",
          );
          gradient.addColorStop(1, "rgba(5, 5, 5, 0)");

          ctx.save();
          ctx.globalCompositeOperation = "screen";
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(spotlight.x, spotlight.y, radius, 0, p.TWO_PI);
          ctx.fill();
          ctx.restore();

          p.strokeWeight(1);

          for (let i = 0; i < (isLowIntensity ? 260 : 850); i += 1) {
            const grainAlpha = p.random(3, 12);
            p.stroke(244, 240, 232, grainAlpha);
            p.point(p.random(p.width), p.random(p.height));
          }

          for (let i = 0; i < (isLowIntensity ? 40 : 140); i += 1) {
            p.stroke(0, 0, 0, p.random(4, 14));
            p.point(p.random(p.width), p.random(p.height));
          }
        };

        p.windowResized = () => {
          p.resizeCanvas(p.windowWidth, p.windowHeight);
        };
      }, containerRef.current);
    }

    loadSketch();

    return () => {
      isMounted = false;

      if (handlePointerMove) {
        window.removeEventListener("pointermove", handlePointerMove);
      }

      p5InstanceRef.current?.remove();
      p5InstanceRef.current = null;
    };
  }, [isLowIntensity]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 h-screen w-screen mix-blend-screen"
    />
  );
}
