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
  *[_type == "project" && defined(slug.current)] | order(shootingDate desc, title asc) {
    _id,
    title,
    "slug": slug.current,
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
    seoTitle,
    seoDescription,
    ogImage
  }
`;

export const homepageSlidesQuery = /* groq */ `
  *[_type == "homepageSlide" && isVisible == true] | order(order asc, title asc) {
    _id,
    title,
    image,
    order,
    isVisible,
    linkedProject->{
      _id,
      title,
      "slug": slug.current
    }
  }
`;

export const projectBySlugQuery = /* groq */ `
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
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
