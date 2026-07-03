export type SanityImageSource =
  | string
  | {
      _type?: "image";
      asset?: {
        _ref?: string;
        _id?: string;
        url?: string;
        metadata?: SanityImageMetadata;
      };
      crop?: Record<string, number>;
      hotspot?: Record<string, number>;
    };

export type SanityImageMetadata = {
  dimensions?: {
    width?: number;
    height?: number;
    aspectRatio?: number;
  };
};

export type SanityCategory = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  order?: number;
  isVisible?: boolean;
  parentCategory?: {
    _id: string;
    title: string;
    slug: string;
  };
  parent?: {
    _id: string;
    title: string;
    slug: string;
  };
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: SanityImageSource;
};

export type SanityProject = {
  _id: string;
  title: string;
  slug: string;
  coverImage?: SanityImageSource;
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
  _type?: "image";
  asset?: {
    _ref?: string;
    _id?: string;
    url?: string;
    metadata?: SanityImageMetadata;
  };
  crop?: Record<string, number>;
  hotspot?: Record<string, number>;
  isCover?: boolean;
  alt?: string;
  caption?: string;
};

export type SanityHomepageCarousel = {
  _id: string;
  title?: string;
  carouselItems?: SanityCarouselItem[];
};

export type CarouselCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type SanityCarouselItem = {
  _key?: string;
  caption?: string;
  selectedImageKey?: string;
  order?: number;
  isVisible?: boolean;
  crop?: CarouselCrop;
  project?: {
    _id: string;
    title: string;
    slug: string;
    galleryImages?: SanityProjectImage[];
  };
};

export type HomeSlide = {
  id: string;
  src: string;
  title?: string;
  slug?: string;
  crop?: CarouselCrop;
};
