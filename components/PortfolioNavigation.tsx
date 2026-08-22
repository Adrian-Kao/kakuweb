"use client";

import { usePathname } from "next/navigation";
import { usePageTransition } from "./PageTransition";

// Frontend typography/color settings: navigation font, text color, accent, and border classes live in className strings below.
const navigationItems = [
  { href: "/", label: " \u2014 HOME" },
  { href: "/about", label: " \u2014 ABOUT" },
  { href: "/gallery", label: " \u2014 WORKS" },
  { href: "/portfolio", label: " \u2014 PORTFOLIO" },
  { href: "/contact", label: " \u2014 CONTACT" },
];

type PortfolioNavigationProps = {
  className?: string;
};

export default function PortfolioNavigation({
  className = "",
}: PortfolioNavigationProps) {
  const pathname = usePathname();
  const { transitionTo } = usePageTransition();

  return (
    <nav
      aria-label="Portfolio sections"
      className={[
        className || "mt-10",
        "scrollbar-hidden flex max-h-[42vh] max-w-xs flex-col overflow-y-auto overscroll-contain pr-1",
      ].join(" ")}
    >
      {navigationItems.map((item) => {
        const isActive =
          item.href === "/gallery"
            ? pathname.startsWith("/gallery")
            : pathname === item.href;

        return (
          <button
            key={item.href}
            type="button"
            aria-pressed={isActive}
            onClick={() => transitionTo(item.href)}
            className={[
              "group flex min-h-12 w-full shrink-0 items-center justify-between border-b py-2 text-left",
              "text-sm uppercase tracking-[0.22em] transition-colors duration-300",
              "focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[#d8b16f]",
              isActive
                ? "border-[#d8b16f] text-[#f4f0e8]"
                : "border-white/10 text-[rgba(244,240,232,0.6)] hover:border-white/30 hover:text-[#f4f0e8]",
            ].join(" ")}
          >
            <span>{item.label}</span>
            <span
              className={[
                "h-px transition-all duration-300",
                isActive ? "w-12 bg-[#d8b16f]" : "w-5 bg-white/25",
              ].join(" ")}
            />
          </button>
        );
      })}
    </nav>
  );
}
