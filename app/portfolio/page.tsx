import PortfolioNavigation from "../../components/PortfolioNavigation";

export default function PortfolioPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-[#f3eee6]">
      <main className="relative z-10 grid min-h-screen grid-cols-1 gap-14 overflow-hidden px-7 py-8 sm:px-12 lg:grid-cols-[22%_78%] lg:px-20 lg:py-12">
        <aside className="flex min-h-[38vh] flex-col justify-between lg:min-h-0">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.42em] text-[#c9a46a]">
              KAKU PHOTOGRAPHY
            </p>

            <h1 className="mt-14 text-5xl font-light uppercase leading-none tracking-[0.08em] text-[#f3eee6] sm:text-6xl">
              Portfolio
            </h1>
          </div>

          <PortfolioNavigation className="mt-14" />
        </aside>

        <section
          aria-label="Portfolio content"
          className="min-h-[72vh] lg:min-h-0"
        />
      </main>
    </div>
  );
}
