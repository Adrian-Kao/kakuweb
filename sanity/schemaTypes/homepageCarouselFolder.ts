import { defineField, defineType } from "sanity";

export const carouselItemType = defineType({
  name: "carouselItem",
  title: "首頁輪播照片",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "輪播照片",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "alt",
      title: "圖片替代文字",
      type: "string",
    }),
    defineField({
      name: "caption",
      title: "輪播說明",
      type: "string",
    }),
    defineField({
      name: "isVisible",
      title: "顯示在首頁",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      caption: "caption",
      alt: "alt",
      image: "image",
      isVisible: "isVisible",
    },
    prepare({ caption, alt, image, isVisible }) {
      return {
        title: caption || alt || "首頁輪播照片",
        subtitle: isVisible ? "顯示在首頁" : "已隱藏",
        media: image,
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
      options: {
        sortable: true,
      },
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "首頁輪播",
        subtitle: "直接上傳首頁輪播照片",
      };
    },
  },
});
