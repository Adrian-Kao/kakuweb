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
  homepageProjectsQuery,
  projectBySlugQuery,
  projectsQuery,
} from "./queries";
import { sanityFetch } from "./client";
import type { HomeSlide, SanityCategory, SanityProject } from "./types";

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
      name: category.title,
      label: `${String(index + 1).padStart(2, "0")} — ${category.title}`,
      shortLabel: category.title,
    }));
}

function mapProjectToSeries(project: SanityProject, fallbackCategoryId: GalleryCategoryId): Series {
  const firstCategory = project.categories?.find((category) => category.isVisible !== false);

  return {
    id: project._id,
    slug: project.slug,
    title: project.title,
    description: project.description ?? "",
    categoryId: firstCategory ? toCategoryId(firstCategory.slug) : fallbackCategoryId,
    coverPhotoId: `${project.slug}-cover`,
  };
}

function mapProjectToPhotos(
  project: SanityProject,
  fallbackCategoryId: GalleryCategoryId,
): GalleryPhoto[] {
  const firstCategory = project.categories?.find((category) => category.isVisible !== false);
  const categoryId = firstCategory ? toCategoryId(firstCategory.slug) : fallbackCategoryId;
  const categoryName = firstCategory?.title ?? "Uncategorized";
  const images = [project.coverImage, ...(project.galleryImages ?? [])].filter(Boolean);

  return images.flatMap((image, index) => {
    const imageUrl = optimizedImageUrl(image, {
      width: index === 0 ? 1400 : 1800,
    });

    if (!imageUrl) {
      return [];
    }

    const number = index + 1;

    return {
      id: index === 0 ? `${project.slug}-cover` : `${project.slug}-${number}`,
      title:
        index === 0
          ? project.title
          : `${project.title} / Frame ${String(number).padStart(2, "0")}`,
      year: project.shootingDate?.slice(0, 4) ?? "",
      imageUrl,
      alt: project.title,
      categoryId,
      categoryName,
      seriesId: project._id,
      seriesSlug: project.slug,
      seriesTitle: project.title,
      featuredOnHome: Boolean(project.showOnHomepage),
      homeOrder: project.homepageOrder ?? 0,
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
  const projects = await sanityFetch<SanityProject[]>({ query: homepageProjectsQuery });

  if (!projects || projects.length === 0) {
    return fallbackHomeSlides;
  }

  const slides = projects.flatMap((project) => {
    const imageUrl = optimizedImageUrl(project.coverImage, { width: 2200 });

    if (!imageUrl) {
      return [];
    }

    return {
      id: project._id,
      src: imageUrl,
      title: project.title,
      slug: project.slug,
    };
  });

  return slides.length > 0 ? slides : fallbackHomeSlides;
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
