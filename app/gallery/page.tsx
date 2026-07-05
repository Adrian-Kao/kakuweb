import type { Metadata } from "next";
import { Suspense } from "react";
import GalleryRoute from "../../components/gallery/GalleryRoute";
import { getGalleryData } from "../../lib/sanity/data";

// Frontend typography/color settings: the Suspense fallback below defines Gallery's loading background and text color.
export const metadata: Metadata = {
  title: "Gallery | KAKU Photography",
  description: "An editorial archive of light, shadow, and memory.",
  openGraph: {
    title: "Gallery | KAKU Photography",
    description: "An editorial archive of light, shadow, and memory.",
  },
};

export default async function GalleryPage() {
  const data = await getGalleryData();

  return (
    <Suspense
      fallback={<div className="min-h-screen bg-[#050505] text-[#f3eee6]" />}
    >
      <GalleryRoute data={data} />
    </Suspense>
  );
}
