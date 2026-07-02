import { defineField, defineType } from "sanity";

export const projectImageType = defineType({
  name: "projectImage",
  title: "作品照片",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "isCover",
      title: "設為封面",
      description: "可直接在照片預覽中勾選封面。若有另外上傳「封面照」，前台會優先使用封面照。",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "alt",
      title: "圖片替代文字",
      type: "string",
      hidden: true,
    }),
    defineField({
      name: "caption",
      title: "照片說明",
      type: "string",
    }),
  ],
  preview: {
    select: {
      media: "asset",
      isCover: "isCover",
      title: "caption",
    },
    prepare({ media, isCover, title }) {
      return {
        title: isCover ? "封面照片" : title || "作品照片",
        subtitle: isCover ? "此照片會作為作品封面" : "作品照片",
        media,
      };
    },
  },
});

export const projectType = defineType({
  name: "project",
  title: "作品管理",
  type: "document",
  groups: [
    { name: "main", title: "作品內容", default: true },
    { name: "advanced", title: "進階設定" },
  ],
  fields: [
    defineField({
      name: "galleryImages",
      title: "整組作品照片",
      description: "新增作品後，請先在這裡拖曳資料夾或一次選擇多張圖片上傳。",
      type: "array",
      of: [{ type: "projectImage" }],
      group: "main",
      validation: (rule) => rule.required().min(1),
    }),
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
      title: "作品分類",
      description: "可選擇既有分類。需要新增分類時，可在分類選擇視窗中建立新分類。",
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
      title: "封面照",
      description: "可選。若不另外上傳，前台會使用上方照片中勾選「設為封面」的那張。",
      type: "image",
      options: { hotspot: true },
      group: "main",
    }),
    defineField({
      name: "description",
      title: "作品介紹",
      type: "text",
      rows: 5,
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
    }),
    defineField({
      name: "seoDescription",
      title: "SEO 描述",
      type: "text",
      rows: 3,
      group: "advanced",
    }),
    defineField({
      name: "ogImage",
      title: "社群分享圖片",
      type: "image",
      options: { hotspot: true },
      group: "advanced",
    }),
  ],
  preview: {
    select: {
      title: "title",
      coverImage: "coverImage",
      images: "galleryImages",
      categories: "categories.0.title",
      shootingDate: "shootingDate",
    },
    prepare({ title, coverImage, images, categories, shootingDate }) {
      const cover =
        coverImage ??
        images?.find((item: { isCover?: boolean }) => item?.isCover) ??
        images?.[0];

      return {
        title: title || "未命名作品",
        subtitle: [categories, shootingDate].filter(Boolean).join(" / "),
        media: cover,
      };
    },
  },
});
