export type GalleryCategoryId = `category-${string}`;

export type Category = {
  id: GalleryCategoryId;
  name: string;
  label: string;
  shortLabel: string;
  parentId?: GalleryCategoryId;
};

export type Series = {
  id: string;
  slug: string;
  title: string;
  description: string;
  categoryId: GalleryCategoryId;
  coverPhotoId?: string;
};

export type GalleryPhoto = {
  id: string;
  title: string;
  year: string;
  imageUrl: string;
  alt: string;
  categoryId: GalleryCategoryId;
  categoryName: string;
  seriesId: string;
  seriesSlug: string;
  seriesTitle: string;
  featuredOnHome: boolean;
  homeOrder: number;
  description: string;
  aspectRatio: string;
  collaborator: string;
  category: GalleryCategoryId;
  src: string;
  orientation: "portrait" | "landscape";
  tone: "light" | "shadow";
};

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const galleryCategories: Category[] = alphabet.map((letter, index) => ({
  id: `category-${letter.toLowerCase()}`,
  name: `Category ${letter}`,
  label: `${String(index + 1).padStart(2, "0")} \u2014 Category ${letter}`,
  shortLabel: `Category ${letter}`,
}));

const seriesSeeds = [
  ["portrait-study", "Portrait Study", "Low-light portraits built around silence and distance."],
  ["shadow-room", "Shadow Room", "A darker archive of bodies, rooms, and withheld detail."],
  ["light-notes", "Light Notes", "Studies of soft light, gestures, and surface memory."],
  ["after-image", "After Image", "Editorial fragments held between motion and stillness."],
  ["still-surface", "Still Surface", "Quiet studio work shaped by texture, breath, and restraint."],
  ["window-hours", "Window Hours", "Available-light portraits made near the edge of day."],
  ["nocturne-figures", "Nocturne Figures", "Figures emerging from black rooms and narrow light."],
  ["silver-contact", "Silver Contact", "A contact-sheet inspired series of close details."],
  ["slow-room", "Slow Room", "Interior portraits with a darkroom rhythm."],
  ["soft-negative", "Soft Negative", "Muted studies of grain, skin, and memory."],
  ["held-light", "Held Light", "Portraits where light becomes a physical gesture."],
  ["quiet-index", "Quiet Index", "An archive of restrained editorial moments."],
];

export const gallerySeries: Series[] = seriesSeeds.map(
  ([slug, title, description], index) => ({
    id: `series-${slug}`,
    slug,
    title,
    description,
    categoryId: galleryCategories[index % galleryCategories.length].id,
    coverPhotoId: `${slug}-1`,
  }),
);

const descriptions = [
  "A quiet study of reflected light and held breath.",
  "A frame suspended between presence and disappearance.",
  "A soft trace of skin, fabric, and darkroom memory.",
  "An image built from restraint, grain, and shadow.",
  "A portrait made from stillness, distance, and available light.",
  "A visual note about memory, texture, and the edge of a room.",
];

const aspectRatios: GalleryPhoto["aspectRatio"][] = [
  "4/5",
  "3/4",
  "5/4",
  "2/3",
  "1/1",
];

const mockImageUrls = ["/1.jpg", "/2.jpg", "/3.jpg", "/4.jpg", "/5.jpg"];

export const galleryPhotos: GalleryPhoto[] = gallerySeries.flatMap(
  (series, seriesIndex) => {
    const category = galleryCategories.find((item) => item.id === series.categoryId);
    const categoryName = category?.name ?? "Category";

    return Array.from({ length: 8 }, (_, photoIndex) => {
      const number = photoIndex + 1;
      const tone = (photoIndex + seriesIndex) % 2 === 0 ? "light" : "shadow";
      const aspectRatio = aspectRatios[(photoIndex + seriesIndex) % aspectRatios.length];
      const isLandscape = aspectRatio === "5/4";
      const imageUrl = mockImageUrls[(photoIndex + seriesIndex) % mockImageUrls.length];

      return {
        id: `${series.slug}-${number}`,
        title: `${series.title} / Frame ${String(number).padStart(2, "0")}`,
        year: String(2020 + ((photoIndex + seriesIndex) % 5)),
        imageUrl,
        alt: `${series.title} frame ${number}`,
        categoryId: series.categoryId,
        categoryName,
        seriesId: series.id,
        seriesSlug: series.slug,
        seriesTitle: series.title,
        featuredOnHome: seriesIndex < 6 && photoIndex < 2,
        homeOrder: seriesIndex * 3 + photoIndex,
        description: descriptions[(photoIndex + seriesIndex) % descriptions.length],
        aspectRatio,
        collaborator: photoIndex % 2 === 0 ? "KAKU Studio" : "Available Light",
        category: series.categoryId,
        src: imageUrl,
        orientation: isLandscape ? "landscape" : "portrait",
        tone,
      };
    });
  },
);

export const featuredHomePhotos = [...galleryPhotos]
  .filter((photo) => photo.featuredOnHome)
  .sort((a, b) => a.homeOrder - b.homeOrder);

export function getSeriesCoverPhoto(series: Series) {
  return (
    galleryPhotos.find((photo) => photo.id === series.coverPhotoId) ??
    galleryPhotos.find((photo) => photo.seriesId === series.id) ??
    null
  );
}
