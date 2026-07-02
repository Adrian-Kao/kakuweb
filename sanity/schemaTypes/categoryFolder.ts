import { defineField, defineType } from "sanity";

export const categoryType = defineType({
  name: "category",
  title: "分類資料夾",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "分類名稱",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "分類網址",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "parentCategory",
      title: "上層分類",
      description: "留空代表大分類；選擇上層分類代表小分類。",
      type: "reference",
      to: [{ type: "category" }],
      options: {
        filter: ({ document }) => ({
          filter: "!defined(parentCategory) && _id != $id",
          params: { id: document?._id?.replace(/^drafts\\./, "") },
        }),
      },
    }),
    defineField({
      name: "description",
      title: "分類介紹",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "order",
      title: "排序",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "isVisible",
      title: "顯示在前台",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "seoTitle",
      title: "SEO 標題",
      type: "string",
      hidden: true,
    }),
    defineField({
      name: "seoDescription",
      title: "SEO 描述",
      type: "text",
      rows: 3,
      hidden: true,
    }),
    defineField({
      name: "ogImage",
      title: "分享圖片",
      type: "image",
      options: { hotspot: true },
      hidden: true,
    }),
  ],
  preview: {
    select: {
      title: "title",
      parentTitle: "parentCategory.title",
    },
    prepare({ title, parentTitle }) {
      return {
        title,
        subtitle: parentTitle ? `${parentTitle} / 小分類` : "大分類",
      };
    },
  },
});
