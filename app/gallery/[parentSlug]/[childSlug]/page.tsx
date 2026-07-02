import type { Metadata } from "next";
import { Suspense } from "react";
import GalleryRoute from "../../../../components/gallery/GalleryRoute";
import {
  getCategoryBySlug,
  getGalleryData,
} from "../../../../lib/sanity/data";
import { optimizedImageUrl } from "../../../../lib/sanity/image";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ parentSlug: string; childSlug: string }>;
}): Promise<Metadata> {
  const { childSlug } = await params;
  const category = await getCategoryBySlug(childSlug);

  if (!category) {
    return {
      title: "Gallery | KAKU Photography",
      description: "An editorial archive of light, shadow, and memory.",
    };
  }

  const title = category.seoTitle ?? `${category.title} | KAKU Photography`;
  const description = category.seoDescription ?? category.description ?? "";
  const image = optimizedImageUrl(category.ogImage, {
    width: 1200,
    height: 630,
  });

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function GalleryChildCategoryPage({
  params,
}: {
  params: Promise<{ parentSlug: string; childSlug: string }>;
}) {
  const { childSlug } = await params;
  const data = await getGalleryData();

  return (
    <Suspense
      fallback={<div className="min-h-screen bg-[#050505] text-[#f3eee6]" />}
    >
      <GalleryRoute forcedSeriesSlug={childSlug} data={data} />
    </Suspense>
  );
}
