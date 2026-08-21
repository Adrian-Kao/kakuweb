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
      title: "舊欄位：圖片替代文字",
      type: "string",
      hidden: true,
    }),
    defineField({
      name: "caption",
      title: "舊欄位：輪播說明",
      type: "string",
      hidden: true,
    }),
    defineField({
      name: "isVisible",
      title: "舊欄位：顯示在首頁",
      type: "boolean",
      hidden: true,
    }),
    defineField({
      name: "selectedImageKey",
      title: "舊欄位：作品集圖片",
      type: "string",
      hidden: true,
    }),
    defineField({
      name: "project",
      title: "舊欄位：來源作品集",
      type: "reference",
      to: [{ type: "project" }],
      hidden: true,
    }),
    defineField({
      name: "crop",
      title: "舊欄位：輪播裁切",
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
