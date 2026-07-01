export const categoriesQuery = /* groq */ `
  *[_type == "category" && isVisible == true] | order(order asc, title asc) {
    _id,
    title,
    "slug": slug.current,
    description,
    order,
    isVisible,
    seoTitle,
    seoDescription,
    ogImage
  }
`;

export const projectsQuery = /* groq */ `
  *[_type == "project" && defined(slug.current)] | order(featuredOrder asc, shootingDate desc, title asc) {
    _id,
    title,
    "slug": slug.current,
    coverImage,
    galleryImages,
    categories[]->{
      _id,
      title,
      "slug": slug.current,
      description,
      order,
      isVisible,
      seoTitle,
      seoDescription,
      ogImage
    },
    description,
    shootingDate,
    location,
    tags,
    showOnHomepage,
    homepageOrder,
    isFeatured,
    featuredOrder,
    seoTitle,
    seoDescription,
    ogImage
  }
`;

export const homepageProjectsQuery = /* groq */ `
  *[_type == "project" && showOnHomepage == true && defined(slug.current)] | order(homepageOrder asc, shootingDate desc, title asc) {
    _id,
    title,
    "slug": slug.current,
    coverImage,
    description,
    shootingDate,
    categories[]->{
      _id,
      title,
      "slug": slug.current,
      isVisible
    },
    showOnHomepage,
    homepageOrder
  }
`;

export const projectBySlugQuery = /* groq */ `
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    coverImage,
    galleryImages,
    categories[]->{
      _id,
      title,
      "slug": slug.current,
      description,
      order,
      isVisible,
      seoTitle,
      seoDescription,
      ogImage
    },
    description,
    shootingDate,
    location,
    tags,
    showOnHomepage,
    homepageOrder,
    isFeatured,
    featuredOrder,
    seoTitle,
    seoDescription,
    ogImage
  }
`;

export const categoryBySlugQuery = /* groq */ `
  *[_type == "category" && slug.current == $slug && isVisible == true][0] {
    _id,
    title,
    "slug": slug.current,
    description,
    order,
    isVisible,
    seoTitle,
    seoDescription,
    ogImage
  }
`;
