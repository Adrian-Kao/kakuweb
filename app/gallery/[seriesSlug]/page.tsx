import type { Metadata } from "next";
import { Suspense } from "react";
import GalleryRoute from "../../../components/gallery/GalleryRoute";
import {
  getCategoryBySlug,
  getGalleryData,
  getProjectBySlug,
} from "../../../lib/sanity/data";
import { optimizedImageUrl } from "../../../lib/sanity/image";

export async function generateStaticParams() {
  const data = await getGalleryData();

  return [
    ...data.series.map((series) => ({
      seriesSlug: series.slug,
    })),
    ...data.categories.map((category) => ({
      seriesSlug: category.id.replace(/^category-/, ""),
    })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ seriesSlug: string }>;
}): Promise<Metadata> {
  const { seriesSlug } = await params;
  const [project, category] = await Promise.all([
    getProjectBySlug(seriesSlug),
    getCategoryBySlug(seriesSlug),
  ]);

  if (project) {
    const title = project.seoTitle ?? `${project.title} | KAKU Photography`;
    const description = project.seoDescription ?? project.description ?? "";
    const coverImage =
      project.coverImage ??
      project.galleryImages?.find((item) => item?.isCover && item.asset) ??
      project.galleryImages?.find((item) => item?.asset);
    const image = optimizedImageUrl(project.ogImage ?? coverImage, {
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

  if (category) {
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

  return {
    title: "Gallery | KAKU Photography",
    description: "An editorial archive of light, shadow, and memory.",
  };
}

export default async function GallerySeriesPage({
  params,
}: {
  params: Promise<{ seriesSlug: string }>;
}) {
  const { seriesSlug } = await params;
  const data = await getGalleryData();

  return (
    <Suspense
      fallback={<div className="min-h-screen bg-[#050505] text-[#f3eee6]" />}
    >
      <GalleryRoute forcedSeriesSlug={seriesSlug} data={data} />
    </Suspense>
  );
}
