import { defineField, defineType } from "sanity";

export const categoryType = defineType({
  name: "category",
  title: "分類",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "分類名稱",
      description: "例如：婚禮攝影、人像寫真、商業形象。",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "分類網址",
      description: "會用在前台網址，例如 wedding 會產生 /gallery/wedding。",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "分類介紹",
      type: "text",
      rows: 4,
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
      title: "是否顯示在前台",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "seoTitle",
      title: "SEO 標題",
      type: "string",
    }),
    defineField({
      name: "seoDescription",
      title: "SEO 描述",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "ogImage",
      title: "社群分享圖片",
      description: "分享連結到社群平台時顯示的圖片。",
      type: "image",
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "slug.current",
    },
  },
});
