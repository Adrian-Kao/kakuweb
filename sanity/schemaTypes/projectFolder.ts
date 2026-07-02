import { defineField, defineType } from "sanity";

export const projectImageType = defineType({
  name: "projectImage",
  title: "作品照片",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "isCover",
      title: "標記為封面",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "caption",
      title: "照片說明",
      type: "string",
    }),
    defineField({
      name: "alt",
      title: "替代文字",
      type: "string",
      hidden: true,
    }),
  ],
  preview: {
    select: {
      media: "asset",
      title: "caption",
      isCover: "isCover",
    },
    prepare({ media, title, isCover }) {
      return {
        title: title || "作品照片",
        subtitle: isCover ? "封面照片" : "作品照片",
        media,
      };
    },
  },
});

export const projectType = defineType({
  name: "project",
  title: "作品集",
  type: "document",
  groups: [
    { name: "main", title: "作品內容", default: true },
    { name: "advanced", title: "進階設定" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "作品名稱",
      type: "string",
      group: "main",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "作品網址",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      group: "main",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "categories",
      title: "所屬分類",
      description: "可選大分類或小分類；若從檔案總管分類中新增作品，會自動帶入。",
      type: "array",
      of: [{ type: "reference", to: [{ type: "category" }] }],
      group: "main",
    }),
    defineField({
      name: "shootingDate",
      title: "拍攝日期",
      type: "date",
      group: "main",
    }),
    defineField({
      name: "coverImage",
      title: "封面照片",
      description: "可在檔案總管中從作品照片快速指定。",
      type: "image",
      options: { hotspot: true },
      group: "main",
    }),
    defineField({
      name: "galleryImages",
      title: "作品照片",
      description: "可拖曳資料夾或一次選擇多張照片上傳。",
      type: "array",
      of: [{ type: "projectImage" }],
      group: "main",
    }),
    defineField({
      name: "description",
      title: "作品介紹",
      type: "text",
      rows: 4,
      group: "main",
    }),
    defineField({
      name: "location",
      title: "拍攝地點",
      type: "string",
      group: "advanced",
    }),
    defineField({
      name: "tags",
      title: "標籤",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      group: "advanced",
    }),
    defineField({
      name: "seoTitle",
      title: "SEO 標題",
      type: "string",
      group: "advanced",
      hidden: true,
    }),
    defineField({
      name: "seoDescription",
      title: "SEO 描述",
      type: "text",
      rows: 3,
      group: "advanced",
      hidden: true,
    }),
    defineField({
      name: "ogImage",
      title: "分享圖片",
      type: "image",
      options: { hotspot: true },
      group: "advanced",
      hidden: true,
    }),
  ],
  preview: {
    select: {
      title: "title",
      coverImage: "coverImage",
      images: "galleryImages",
      category: "categories.0.title",
      shootingDate: "shootingDate",
    },
    prepare({ title, coverImage, images, category, shootingDate }) {
      const cover =
        coverImage ??
        images?.find((item: { isCover?: boolean }) => item?.isCover) ??
        images?.[0];

      return {
        title: title || "未命名作品集",
        subtitle: [category, shootingDate].filter(Boolean).join(" / "),
        media: cover,
      };
    },
  },
});
