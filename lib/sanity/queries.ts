export const categoriesQuery = /* groq */ `
  *[_type == "category" && isVisible == true] | order(order asc, title asc) {
    _id,
    title,
    "slug": slug.current,
    description,
    order,
    isVisible,
    parentCategory->{
      _id,
      title,
      "slug": slug.current
    },
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
    coverImage{..., asset->{_id, url, metadata{dimensions{width, height, aspectRatio}}}},
    galleryImages[]{..., asset->{_id, url, metadata{dimensions{width, height, aspectRatio}}}},
    categories[]->{
      _id,
      title,
      "slug": slug.current,
      description,
      order,
      isVisible,
      parentCategory->{
        _id,
        title,
        "slug": slug.current
      },
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

export const homepageCarouselQuery = /* groq */ `
  *[_type == "homepageCarousel" && _id == "homepageCarousel"][0] {
    _id,
    title,
    carouselItems[isVisible != false] {
      _key,
      selectedImageKey,
      isVisible,
      crop,
      project->{
        _id,
        title,
        "slug": slug.current,
        galleryImages[]{..., asset->{_id, url, metadata{dimensions{width, height, aspectRatio}}}}
      }
    }
  }
`;

export const projectBySlugQuery = /* groq */ `
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    coverImage{..., asset->{_id, url, metadata{dimensions{width, height, aspectRatio}}}},
    galleryImages[]{..., asset->{_id, url, metadata{dimensions{width, height, aspectRatio}}}},
    categories[]->{
      _id,
      title,
      "slug": slug.current,
      description,
      order,
      isVisible,
      parentCategory->{
        _id,
        title,
        "slug": slug.current
      },
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
    parentCategory->{
      _id,
      title,
      "slug": slug.current
    },
    seoTitle,
    seoDescription,
    ogImage
  }
`;
