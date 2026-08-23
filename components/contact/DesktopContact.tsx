"use client";

import PortfolioNavigation from "../PortfolioNavigation";
import ContactForm from "./ContactForm";

export default function DesktopContact() {
  return (
    <div className="relative h-screen overflow-hidden bg-[#050505] text-[#f3eee6]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_46%,rgba(201,164,106,0.08),transparent_36%)]" />

      <main className="relative z-10 grid h-screen grid-cols-[clamp(12rem,11vw,14rem)_minmax(0,1fr)] gap-14 overflow-hidden px-20 py-12">
        <aside className="flex h-[calc(100vh-6rem)] flex-col justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.42em] text-[#c9a46a]">
              野次馬工作室
            </p>
            <h1 className="mt-14 max-w-full break-words text-[clamp(2rem,2.4vw,3rem)] font-light uppercase leading-none tracking-[0.08em]">
              Contact
            </h1>
          </div>

          <PortfolioNavigation className="mt-14" />
        </aside>

        <section className="flex min-w-0 items-center justify-center">
          <div className="w-full max-w-[38rem]">
           
            <ContactForm />
          </div>
        </section>
      </main>
    </div>
  );
}
