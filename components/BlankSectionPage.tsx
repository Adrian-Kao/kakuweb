import PortfolioNavigation from "./PortfolioNavigation";

// Frontend typography/color settings: Tailwind font, text, background, and color classes are marked in className strings below.
type BlankSectionPageProps = {
  label: string;
};

export default function BlankSectionPage({ label }: BlankSectionPageProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] px-7 py-8 text-[#f4f0e8] sm:px-12 lg:px-20 lg:py-12">
      <div className="flex min-h-[calc(100vh-6rem)] max-w-md flex-col justify-end">
        <p className="mb-10 text-xs font-medium uppercase tracking-[0.42em] text-[#d8b16f]">
          {label}
        </p>
        <PortfolioNavigation />
      </div>
    </main>
  );
}
