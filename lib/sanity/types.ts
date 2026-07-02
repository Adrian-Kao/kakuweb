export type SanityImageSource =
  | string
  | {
      _type?: "image";
      asset?: {
        _ref?: string;
        _id?: string;
        url?: string;
      };
      crop?: Record<string, number>;
      hotspot?: Record<string, number>;
    };

export type SanityCategory = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  order?: number;
  isVisible?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: SanityImageSource;
};

export type SanityProject = {
  _id: string;
  title: string;
  slug: string;
  galleryImages?: SanityProjectImage[];
  categories?: SanityCategory[];
  description?: string;
  shootingDate?: string;
  location?: string;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: SanityImageSource;
};

export type SanityProjectImage = {
  _key?: string;
  image?: SanityImageSource;
  isCover?: boolean;
  alt?: string;
  caption?: string;
};

export type SanityHomepageCarousel = {
  _id: string;
  title?: string;
  carouselItems?: SanityCarouselItem[];
};

export type SanityCarouselItem = {
  _key?: string;
  caption?: string;
  image?: SanityImageSource;
  order?: number;
  isVisible?: boolean;
  project?: {
    _id: string;
    title: string;
    slug: string;
  };
};

export type HomeSlide = {
  id: string;
  src: string;
  title?: string;
  slug?: string;
};
