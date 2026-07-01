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
import MobileTopBar from "./mobile/MobileTopBar";

type PageTransitionContextValue = {
  transitionTo: (href: string) => void;
};

const PageTransitionContext = createContext<PageTransitionContextValue | null>(
  null,
);

const transitionInDuration = 420;
const transitionOutDuration = 420;
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

      await animateTransition(1, transitionInDuration);

      waitingForRouteRef.current = true;
      router.push(href);

      routeFallbackTimerRef.current = setTimeout(() => {
        if (!waitingForRouteRef.current) {
          return;
        }

        waitingForRouteRef.current = false;
        pendingHrefRef.current = null;

        animateTransition(0, transitionOutDuration).then(() => {
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

    animateTransition(0, transitionOutDuration).then(() => {
      applyTransitionAmount(0);
      isTransitioningRef.current = false;
    });
  }, [animateTransition, applyTransitionAmount, pathname]);

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }

      if (routeFallbackTimerRef.current) {
        clearTimeout(routeFallbackTimerRef.current);
      }
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
    </PageTransitionContext.Provider>
  );
}
