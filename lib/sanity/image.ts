import { createImageUrlBuilder } from "@sanity/image-url";
import { dataset, studioProjectId } from "./env";
import type { SanityImageSource } from "./types";

const builder = createImageUrlBuilder({
  projectId: studioProjectId,
  dataset,
});

export function urlForImage(source: SanityImageSource) {
  return builder.image(source).auto("format").fit("max");
}

export function optimizedImageUrl(
  source: SanityImageSource | null | undefined,
  options: { width?: number; height?: number } = {},
) {
  if (!source) {
    return null;
  }

  let image = urlForImage(source);

  if (options.width) {
    image = image.width(options.width);
  }

  if (options.height) {
    image = image.height(options.height).fit("crop");
  }

  return image.url();
}
