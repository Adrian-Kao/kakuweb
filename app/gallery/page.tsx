import { Suspense } from "react";
import GalleryRoute from "../../components/gallery/GalleryRoute";

export default function GalleryPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-[#050505] text-[#f3eee6]" />}
    >
      <GalleryRoute />
    </Suspense>
  );
}
