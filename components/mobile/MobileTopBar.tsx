"use client";

import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

const menuItems = [
  { href: "/", label: "01 \u2014 HOME" },
  { href: "/about", label: "02 \u2014 ABOUT ME" },
  { href: "/gallery", label: "03 \u2014 GALLERY" },
];

const pageTitles: Record<string, string> = {
  "/": "KAKU PHOTOGRAPHY",
  "/about": "ABOUT ME",
  "/gallery": "GALLERY",
};

type MobileTopBarProps = {
  transitionTo: (href: string) => void;
};

export default function MobileTopBar({ transitionTo }: MobileTopBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const title = useMemo(() => {
    if (pathname.startsWith("/gallery")) {
      return "GALLERY";
    }

    return pageTitles[pathname] ?? "KAKU PHOTOGRAPHY";
  }, [pathname]);

  const handleNavigate = (href: string) => {
    setIsOpen(false);
    transitionTo(href);
  };

  return (
    <>
      <header className="fixed left-0 top-0 z-[1000] flex w-full items-center border-b border-white/10 bg-[rgba(5,5,5,0.9)] px-5 pb-3 pt-[calc(env(safe-area-inset-top)+12px)] text-[#f3eee6] backdrop-blur-md lg:hidden">
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(true)}
          className="flex h-12 w-12 flex-col items-start justify-center gap-1.5"
        >
          <span className="h-px w-7 bg-[#f3eee6]" />
          <span className="h-px w-7 bg-[#f3eee6]" />
          <span className="h-px w-7 bg-[#f3eee6]" />
        </button>

        <p className="flex-1 text-center text-[0.68rem] uppercase tracking-[0.32em] text-[#c9a46a]">
          {title}
        </p>

        <div aria-hidden="true" className="h-12 w-12" />
      </header>

      <div
        className={[
          "fixed inset-0 z-[1100] bg-[#050505]/88 backdrop-blur-md transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={() => setIsOpen(false)}
      />

      <nav
        aria-label="Mobile portfolio menu"
        className={[
          "fixed inset-0 z-[1200] flex flex-col justify-between bg-[#050505] px-8 pb-10 pt-[calc(env(safe-area-inset-top)+32px)] text-[#f3eee6] transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      >
        <div>
          <div className="flex items-start justify-between gap-5">
            <p className="max-w-[12rem] text-xs uppercase tracking-[0.42em] text-[#c9a46a]">
              KAKU PHOTOGRAPHY
            </p>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setIsOpen(false)}
              className="text-2xl font-light leading-none text-[rgba(243,238,230,0.68)] transition hover:text-[#f3eee6]"
            >
              x
            </button>
          </div>

          <div className="mt-20 flex flex-col gap-2">
            {menuItems.map((item) => {
              const isActive =
                item.href === "/gallery"
                  ? pathname.startsWith("/gallery")
                  : pathname === item.href;

              return (
                <button
                  key={item.href}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => handleNavigate(item.href)}
                  className={[
                    "border-b py-5 text-left text-base uppercase tracking-[0.24em] transition",
                    isActive
                      ? "border-[#c9a46a] text-[#f3eee6]"
                      : "border-white/10 text-[rgba(243,238,230,0.58)] hover:text-[#f3eee6]",
                  ].join(" ")}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <p className="max-w-[14rem] text-sm leading-6 text-[rgba(243,238,230,0.62)]">
          Light reveals. Shadow remembers.
        </p>
      </nav>
    </>
  );
}
