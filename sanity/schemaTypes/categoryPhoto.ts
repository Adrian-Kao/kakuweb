import { defineField, defineType } from "sanity";

export const categoryType = defineType({
  name: "category",
  title: "分類",
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
      name: "parent",
      title: "上層分類",
      description: "若這是小分類，請選擇所屬的大分類。例如「戶外」的上層分類可選「婚禮」。",
      type: "reference",
      to: [{ type: "category" }],
      options: {
        filter: ({ document }) => ({
          filter: "!defined(parent) && _id != $id",
          params: { id: document?._id?.replace(/^drafts\\./, "") },
        }),
      },
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
      title: "社群分享圖片",
      type: "image",
      options: { hotspot: true },
      hidden: true,
    }),
  ],
  preview: {
    select: {
      title: "title",
      parent: "parent.title",
    },
    prepare({ title, parent }) {
      return {
        title,
        subtitle: parent ? `小分類 / ${parent}` : "大分類",
      };
    },
  },
});
