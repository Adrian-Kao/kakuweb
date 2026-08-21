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
  ],
  preview: {
    select: {
      image: "image",
    },
    prepare({ image }) {
      return {
        title: "首頁輪播照片",
        subtitle: "可使用圖片欄位內建裁切",
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
