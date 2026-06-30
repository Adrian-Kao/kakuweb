import { Suspense } from "react";
import GalleryRoute from "../../../components/gallery/GalleryRoute";
import { gallerySeries } from "../../../data/gallery";

export function generateStaticParams() {
  return gallerySeries.map((series) => ({
    seriesSlug: series.slug,
  }));
}

export default async function GallerySeriesPage({
  params,
}: {
  params: Promise<{ seriesSlug: string }>;
}) {
  const { seriesSlug } = await params;

  return (
    <Suspense
      fallback={<div className="min-h-screen bg-[#050505] text-[#f3eee6]" />}
    >
      <GalleryRoute forcedSeriesSlug={seriesSlug} />
    </Suspense>
  );
}
