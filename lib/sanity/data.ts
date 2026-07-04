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
    .map((category, index) => {
      const parent = category.parentCategory ?? category.parent;
      const displayName = parent ? `${parent.title} / ${category.title}` : category.title;

      return {
        id: toCategoryId(category.slug),
        name: displayName,
        label: `${String(index + 1).padStart(2, "0")} — ${displayName}`,
        shortLabel: displayName,
        parentId: parent ? toCategoryId(parent.slug) : undefined,
      };
    });
}

function mapProjectToSeries(project: SanityProject, fallbackCategoryId: GalleryCategoryId): Series {
  const firstCategory = getProjectDisplayCategory(project);
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

function getProjectDisplayCategory(project: SanityProject) {
  const visibleCategories =
    project.categories?.filter((category) => category && category.isVisible !== false) ?? [];

  return (
    visibleCategories.find((category) => category.parentCategory || category.parent) ??
    visibleCategories[0] ??
    null
  );
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

function getImageAspectRatio(image: SanityProjectImage) {
  const dimensions = image.asset?.metadata?.dimensions;

  if (
    dimensions?.aspectRatio &&
    Number.isFinite(dimensions.aspectRatio) &&
    dimensions.aspectRatio > 0
  ) {
    return `${dimensions.aspectRatio} / 1`;
  }

  if (dimensions?.width && dimensions.height) {
    return `${dimensions.width} / ${dimensions.height}`;
  }

  return "4 / 5";
}

function mapProjectToPhotos(
  project: SanityProject,
  fallbackCategoryId: GalleryCategoryId,
): GalleryPhoto[] {
  const firstCategory = getProjectDisplayCategory(project);
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
    const title =
      index === 0
        ? project.title
        : `${project.title} / Frame ${String(number).padStart(2, "0")}`;

    return {
      id: item._key ? `${project.slug}-${item._key}` : `${project.slug}-${number}`,
      title,
      year: project.shootingDate?.slice(0, 4) ?? "",
      imageUrl,
      alt: item.alt || title,
      categoryId,
      categoryName,
      seriesId: project._id,
      seriesSlug: project.slug,
      seriesTitle: project.title,
      featuredOnHome: false,
      homeOrder: 0,
      description: project.description ?? "",
      aspectRatio: getImageAspectRatio(item),
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
      crop: slide.crop,
    };
  });

  return mappedSlides;
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
