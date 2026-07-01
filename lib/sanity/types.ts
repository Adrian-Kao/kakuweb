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
  coverImage?: SanityImageSource;
  galleryImages?: SanityImageSource[];
  categories?: SanityCategory[];
  description?: string;
  shootingDate?: string;
  location?: string;
  tags?: string[];
  showOnHomepage?: boolean;
  homepageOrder?: number;
  isFeatured?: boolean;
  featuredOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: SanityImageSource;
};

export type HomeSlide = {
  id: string;
  src: string;
  title?: string;
  slug?: string;
};
