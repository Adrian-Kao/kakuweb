import { defineField, defineType } from "sanity";

export const homepageSlideType = defineType({
  name: "homepageSlide",
  title: "首頁輪播照片",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "輪播名稱",
      description: "只在後台辨識用，不一定會顯示在前台。",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "輪播照片",
      description: "首頁背景輪播會使用這張照片。建議使用橫式或適合滿版裁切的照片。",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "linkedProject",
      title: "連結到作品",
      description: "可選。若之後需要點擊輪播進入作品頁，會使用這個作品連結。",
      type: "reference",
      to: [{ type: "project" }],
    }),
    defineField({
      name: "order",
      title: "排序",
      description: "數字越小越前面。",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "isVisible",
      title: "是否顯示在首頁",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "image",
      isVisible: "isVisible",
    },
    prepare({ title, media, isVisible }) {
      return {
        title,
        subtitle: isVisible ? "顯示在首頁輪播" : "已隱藏",
        media,
      };
    },
  },
});
