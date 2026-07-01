import { defineField, defineType } from "sanity";

export const projectImageType = defineType({
  name: "projectImage",
  title: "作品照片",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "照片",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "isCover",
      title: "設為封面",
      description: "在這組作品照片中勾選一張作為 Gallery 封面。若多張被勾選，前台會使用第一張。",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "alt",
      title: "圖片替代文字",
      description: "給搜尋引擎與無障礙閱讀使用，可簡短描述照片內容。",
      type: "string",
    }),
    defineField({
      name: "caption",
      title: "照片說明",
      type: "string",
    }),
  ],
  preview: {
    select: {
      media: "image",
      isCover: "isCover",
      title: "caption",
    },
    prepare({ media, isCover, title }) {
      return {
        title: isCover ? "封面照片" : title || "作品照片",
        subtitle: isCover ? "此照片會作為 Gallery 封面" : "作品照片",
        media,
      };
    },
  },
});

export const projectType = defineType({
  name: "project",
  title: "作品",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "作品名稱",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "作品網址",
      description: "會用在前台網址，例如 portrait-study 會產生 /gallery/portrait-study。",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "galleryImages",
      title: "整組作品照片",
      description: "請把同一組作品的照片上傳到這裡，再於照片預覽中勾選一張「設為封面」。",
      type: "array",
      of: [{ type: "projectImage" }],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "categories",
      title: "分類",
      description: "可以選擇一個或多個分類。",
      type: "array",
      of: [{ type: "reference", to: [{ type: "category" }] }],
    }),
    defineField({
      name: "description",
      title: "作品介紹",
      type: "text",
      rows: 5,
    }),
    defineField({
      name: "shootingDate",
      title: "拍攝日期",
      type: "date",
    }),
    defineField({
      name: "location",
      title: "拍攝地點",
      type: "string",
    }),
    defineField({
      name: "tags",
      title: "標籤",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
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
      description: "分享連結到社群平台時顯示的圖片；若未設定，前台會使用封面照片。",
      type: "image",
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: {
      title: "title",
      images: "galleryImages",
      subtitle: "location",
    },
    prepare({ title, images, subtitle }) {
      const cover = images?.find((item: { isCover?: boolean }) => item?.isCover) ?? images?.[0];

      return {
        title,
        subtitle,
        media: cover?.image,
      };
    },
  },
});
