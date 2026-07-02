import {
  galleryCategories as fallbackCategories,
  galleryPhotos as fallbackPhotos,
  gallerySeries as fallbackSeries,
  type Category,
  type GalleryCategoryId,
  type GalleryPhoto,
  type Series,
} from "../../data/gallery";
import { optimizedImageUrl } from "./image";
import {
  categoriesQuery,
  categoryBySlugQuery,
  homepageCarouselQuery,
  projectBySlugQuery,
  projectsQuery,
} from "./queries";
import { sanityFetch } from "./client";
import type {
  HomeSlide,
  SanityCategory,
  SanityHomepageCarousel,
  SanityProject,
  SanityProjectImage,
} from "./types";

export type GalleryData = {
  categories: Category[];
  series: Series[];
  photos: GalleryPhoto[];
};

const fallbackHomeSlides: HomeSlide[] = [
  { id: "home-slide-1", src: "/1.jpg" },
  { id: "home-slide-2", src: "/2.jpg" },
  { id: "home-slide-3", src: "/3.jpg" },
  { id: "home-slide-4", src: "/4.jpg" },
  { id: "home-slide-5", src: "/5.jpg" },
];

export const fallbackGalleryData: GalleryData = {
  categories: fallbackCategories,
  series: fallbackSeries,
  photos: fallbackPhotos,
};

function toCategoryId(slug: string): GalleryCategoryId {
  return `category-${slug}` as GalleryCategoryId;
}

function mapCategories(categories: SanityCategory[]): Category[] {
  return categories
    .filter((category) => category.isVisible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((category, index) => ({
      id: toCategoryId(category.slug),
      name: category.parent ? `${category.parent.title} / ${category.title}` : category.title,
      label: `${String(index + 1).padStart(2, "0")} — ${
        category.parent ? `${category.parent.title} / ${category.title}` : category.title
      }`,
      shortLabel: category.parent ? `${category.parent.title} / ${category.title}` : category.title,
    }));
}

function mapProjectToSeries(project: SanityProject, fallbackCategoryId: GalleryCategoryId): Series {
  const firstCategory = project.categories?.find((category) => category.isVisible !== false);
  const cover = getProjectCoverImage(project);

  return {
    id: project._id,
    slug: project.slug,
    title: project.title,
    description: project.description ?? "",
    categoryId: firstCategory ? toCategoryId(firstCategory.slug) : fallbackCategoryId,
    coverPhotoId: cover?._key ? `${project.slug}-${cover._key}` : `${project.slug}-cover`,
  };
}

function getCoverImageAsProjectImage(project: SanityProject): SanityProjectImage | null {
  if (!project.coverImage || typeof project.coverImage !== "object") {
    return null;
  }

  return {
    ...project.coverImage,
    _key: "cover",
    isCover: true,
  };
}

function getProjectCoverImage(project: SanityProject) {
  return (
    getCoverImageAsProjectImage(project) ??
    project.galleryImages?.find((item) => item?.isCover && item.asset) ??
    project.galleryImages?.find((item) => item?.asset) ??
    null
  );
}

function getProjectImages(project: SanityProject): SanityProjectImage[] {
  const images = project.galleryImages?.filter((item) => item?.asset) ?? [];
  const cover = project.galleryImages?.find((item) => item?.isCover && item.asset) ?? null;
  const otherImages = images.filter((item) => item !== cover);

  const coverImage = getCoverImageAsProjectImage(project);

  if (coverImage) {
    return [coverImage, ...images];
  }

  return cover ? [cover, ...otherImages] : images;
}

function mapProjectToPhotos(
  project: SanityProject,
  fallbackCategoryId: GalleryCategoryId,
): GalleryPhoto[] {
  const firstCategory = project.categories?.find((category) => category.isVisible !== false);
  const categoryId = firstCategory ? toCategoryId(firstCategory.slug) : fallbackCategoryId;
  const categoryName = firstCategory?.title ?? "未分類";
  const images = getProjectImages(project);

  return images.flatMap((item, index) => {
    const imageUrl = optimizedImageUrl(item, {
      width: index === 0 ? 1400 : 1800,
    });

    if (!imageUrl) {
      return [];
    }

    const number = index + 1;

    return {
      id: item._key ? `${project.slug}-${item._key}` : `${project.slug}-${number}`,
      title:
        index === 0
          ? project.title
          : item.caption || `${project.title} / Frame ${String(number).padStart(2, "0")}`,
      year: project.shootingDate?.slice(0, 4) ?? "",
      imageUrl,
      alt: item.alt || project.title,
      categoryId,
      categoryName,
      seriesId: project._id,
      seriesSlug: project.slug,
      seriesTitle: project.title,
      featuredOnHome: false,
      homeOrder: 0,
      description: project.description ?? "",
      aspectRatio: "4/5",
      collaborator: project.location ?? "KAKU Photography",
      category: categoryId,
      src: imageUrl,
      orientation: "portrait",
      tone: "shadow",
    } satisfies GalleryPhoto;
  });
}

function mapGalleryData(categories: SanityCategory[], projects: SanityProject[]): GalleryData {
  if (categories.length === 0 || projects.length === 0) {
    return fallbackGalleryData;
  }

  const mappedCategories = mapCategories(categories);
  const fallbackCategoryId = mappedCategories[0]?.id ?? ("category-all" as GalleryCategoryId);
  const series = projects.map((project) => mapProjectToSeries(project, fallbackCategoryId));
  const photos = projects.flatMap((project) => mapProjectToPhotos(project, fallbackCategoryId));

  return {
    categories: mappedCategories,
    series,
    photos,
  };
}

export async function getGalleryData(): Promise<GalleryData> {
  const [categories, projects] = await Promise.all([
    sanityFetch<SanityCategory[]>({ query: categoriesQuery }),
    sanityFetch<SanityProject[]>({ query: projectsQuery }),
  ]);

  if (!categories || !projects) {
    return fallbackGalleryData;
  }

  return mapGalleryData(categories, projects);
}

export async function getHomeSlides(): Promise<HomeSlide[]> {
  const carousel = await sanityFetch<SanityHomepageCarousel | null>({
    query: homepageCarouselQuery,
  });
  const slides = carousel?.carouselItems ?? [];

  if (slides.length === 0) {
    return fallbackHomeSlides;
  }

  const mappedSlides = slides.flatMap((slide) => {
    const selectedImage = slide.project?.galleryImages?.find(
      (item) => item._key === slide.selectedImageKey,
    );
    const imageUrl = optimizedImageUrl(selectedImage, { width: 2200 });

    if (!imageUrl) {
      return [];
    }

    return {
      id: slide._key ?? imageUrl,
      src: imageUrl,
      title: slide.caption ?? slide.project?.title,
      slug: slide.project?.slug,
    };
  });

  return mappedSlides.length > 0 ? mappedSlides : fallbackHomeSlides;
}

export async function getProjectBySlug(slug: string) {
  return sanityFetch<SanityProject | null>({
    query: projectBySlugQuery,
    params: { slug },
  });
}

export async function getCategoryBySlug(slug: string) {
  return sanityFetch<SanityCategory | null>({
    query: categoryBySlugQuery,
    params: { slug },
  });
}
