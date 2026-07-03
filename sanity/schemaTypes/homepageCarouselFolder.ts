import { defineField, defineType } from "sanity";
import HomepageCarouselPreviewInput from "../components/HomepageCarouselPreviewInput";

export const carouselItemType = defineType({
  name: "carouselItem",
  title: "首頁輪播照片",
  type: "object",
  fields: [
    defineField({
      name: "project",
      title: "來源作品集",
      type: "reference",
      to: [{ type: "project" }],
    }),
    defineField({
      name: "selectedImageKey",
      title: "輪播照片",
      type: "string",
    }),
    defineField({
      name: "isVisible",
      title: "顯示在首頁",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "crop",
      title: "首頁輪播裁切",
      type: "object",
      hidden: true,
      fields: [
        defineField({ name: "x", title: "X", type: "number" }),
        defineField({ name: "y", title: "Y", type: "number" }),
        defineField({ name: "width", title: "寬度", type: "number" }),
        defineField({ name: "height", title: "高度", type: "number" }),
      ],
    }),
  ],
  preview: {
    select: {
      projectTitle: "project.title",
      selectedImageKey: "selectedImageKey",
      images: "project.galleryImages",
      coverImage: "project.coverImage",
      isVisible: "isVisible",
    },
    prepare({ projectTitle, selectedImageKey, images, coverImage, isVisible }) {
      const selectedImage = images?.find(
        (image: { _key?: string }) => image?._key === selectedImageKey,
      );

      return {
        title: projectTitle || "首頁輪播照片",
        subtitle: isVisible ? "顯示在首頁" : "已隱藏",
        media: selectedImage ?? coverImage,
      };
    },
  },
});

export const homepageCarouselType = defineType({
  name: "homepageCarousel",
  title: "首頁輪播",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "管理頁名稱",
      type: "string",
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: "carouselItems",
      title: "首頁輪播照片",
      type: "array",
      of: [{ type: "carouselItem" }],
      components: {
        input: HomepageCarouselPreviewInput as never,
      },
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "首頁輪播",
        subtitle: "從作品集中挑選首頁照片",
      };
    },
  },
});
