"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import type p5 from "p5";
import MobileTopBar from "./mobile/MobileTopBar";

type PageTransitionContextValue = {
  transitionTo: (href: string) => void;
};

const PageTransitionContext = createContext<PageTransitionContextValue | null>(
  null,
);

const idleNoise = 0;
const noiseInDuration = 420;
const noiseOutDuration = 420;
const routeSwitchFallbackDelay = 160;
const maxBlur = 10;
const maxScale = 1.01;

export function usePageTransition() {
  const context = useContext(PageTransitionContext);

  if (!context) {
    throw new Error("usePageTransition must be used inside PageTransitionProvider");
  }

  return context;
}

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);
  const noiseAmountRef = useRef(idleNoise);
  const transitionAmountRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const isTransitioningRef = useRef(false);
  const waitingForRouteRef = useRef(false);
  const pendingHrefRef = useRef<string | null>(null);
  const routeFallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const applyTransitionAmount = useCallback((amount: number) => {
    transitionAmountRef.current = amount;
    noiseAmountRef.current = idleNoise + (1 - idleNoise) * amount;

    if (!contentRef.current) {
      return;
    }

    const blur = amount * maxBlur;
    const scale = 1 + (maxScale - 1) * amount;
    const opacity = 1 - amount * 0.08;

    contentRef.current.style.filter = `blur(${blur.toFixed(2)}px)`;
    contentRef.current.style.transform = `scale(${scale.toFixed(4)})`;
    contentRef.current.style.opacity = opacity.toFixed(3);
  }, []);

  const animateTransition = useCallback(
    (to: number, duration: number) => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }

      const from = transitionAmountRef.current;
      const startedAt = performance.now();

      return new Promise<void>((resolve) => {
        const tick = (now: number) => {
          const progress = Math.min((now - startedAt) / duration, 1);
          const eased = progress * progress * (3 - 2 * progress);

          applyTransitionAmount(from + (to - from) * eased);

          if (progress < 1) {
            frameRef.current = requestAnimationFrame(tick);
            return;
          }

          frameRef.current = null;
          resolve();
        };

        frameRef.current = requestAnimationFrame(tick);
      });
    },
    [applyTransitionAmount],
  );

  const transitionTo = useCallback(
    async (href: string) => {
      if (isTransitioningRef.current || href === pathname) {
        return;
      }

      isTransitioningRef.current = true;
      pendingHrefRef.current = href;

      await animateTransition(1, noiseInDuration);

      waitingForRouteRef.current = true;
      router.push(href);

      routeFallbackTimerRef.current = setTimeout(() => {
        if (!waitingForRouteRef.current) {
          return;
        }

        waitingForRouteRef.current = false;
        pendingHrefRef.current = null;

        animateTransition(0, noiseOutDuration).then(() => {
          applyTransitionAmount(0);
          isTransitioningRef.current = false;
        });
      }, routeSwitchFallbackDelay);
    },
    [animateTransition, applyTransitionAmount, pathname, router],
  );

  useEffect(() => {
    if (!waitingForRouteRef.current || pendingHrefRef.current !== pathname) {
      return;
    }

    waitingForRouteRef.current = false;
    pendingHrefRef.current = null;

    if (routeFallbackTimerRef.current) {
      clearTimeout(routeFallbackTimerRef.current);
      routeFallbackTimerRef.current = null;
    }

    animateTransition(0, noiseOutDuration).then(() => {
      applyTransitionAmount(0);
      isTransitioningRef.current = false;
    });
  }, [animateTransition, applyTransitionAmount, pathname]);

  useEffect(() => {
    let isMounted = true;

    async function loadTransitionCanvas() {
      const p5Module = await import("p5");
      const P5 = p5Module.default;

      if (!isMounted || !containerRef.current || p5InstanceRef.current) {
        return;
      }

      p5InstanceRef.current = new P5((p: p5) => {
        p.setup = () => {
          p.createCanvas(p.windowWidth, p.windowHeight);
          p.pixelDensity(Math.min(window.devicePixelRatio, 2));
          p.frameRate(30);
          p.noStroke();
        };

        p.draw = () => {
          const amount = noiseAmountRef.current;
          p.clear();

          if (amount <= 0.005) {
            return;
          }

          const ctx = p.drawingContext as CanvasRenderingContext2D;
          ctx.save();
          ctx.globalCompositeOperation = "source-over";
          ctx.fillStyle = `rgba(5, 5, 5, ${amount * 0.38})`;
          ctx.fillRect(0, 0, p.width, p.height);
          ctx.restore();

          const area = p.width * p.height;
          const grainCount = Math.floor(area * (0.00004 + amount * 0.00145));
          const maxGrainSize = p.lerp(0.45, 1.55, amount);

          for (let i = 0; i < grainCount; i += 1) {
            const tone = p.random() < 0.54 ? p.random(205, 245) : p.random(10, 70);
            const warmth = p.random() < 0.16 ? p.random(8, 22) : 0;
            const alpha = p.random(18, 125) * amount;

            p.fill(
              p.constrain(tone + warmth, 0, 255),
              p.constrain(tone + warmth * 0.66, 0, 255),
              p.constrain(tone, 0, 255),
              alpha,
            );
            p.rect(
              p.random(p.width),
              p.random(p.height),
              p.random(0.45, maxGrainSize),
              p.random(0.45, maxGrainSize),
            );
          }
        };

        p.windowResized = () => {
          p.resizeCanvas(p.windowWidth, p.windowHeight);
        };
      }, containerRef.current);
    }

    loadTransitionCanvas();

    return () => {
      isMounted = false;

      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }

      if (routeFallbackTimerRef.current) {
        clearTimeout(routeFallbackTimerRef.current);
      }

      p5InstanceRef.current?.remove();
      p5InstanceRef.current = null;
    };
  }, []);

  return (
    <PageTransitionContext.Provider value={{ transitionTo }}>
      <MobileTopBar transitionTo={transitionTo} />
      <div
        ref={contentRef}
        className="min-h-full origin-center will-change-[filter,opacity,transform]"
      >
        {children}
      </div>
      <div
        ref={containerRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[9999]"
      />
    </PageTransitionContext.Provider>
  );
}
