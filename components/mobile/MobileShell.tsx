"use client";

import type { ReactNode } from "react";

// Frontend typography/color settings: mobile shell background and base text color are controlled by the wrapper className below.
type MobileShellProps = {
  children: ReactNode;
};

export default function MobileShell({ children }: MobileShellProps) {
  return (
    <div className="min-h-screen bg-[#050505] text-[#f3eee6]">
      <main className="min-h-screen overflow-x-hidden pt-[88px]">{children}</main>
    </div>
  );
}
