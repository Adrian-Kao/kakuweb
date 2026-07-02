import { defineField, defineType } from "sanity";

export const categoryType = defineType({
  name: "category",
  title: "\u5206\u985e",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "\u5206\u985e\u540d\u7a31",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "\u5206\u985e\u7db2\u5740",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "\u5206\u985e\u4ecb\u7d39",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "order",
      title: "\u6392\u5e8f",
      description: "\u6578\u5b57\u8d8a\u5c0f\u8d8a\u524d\u9762\u3002",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "isVisible",
      title: "\u986f\u793a\u5728\u524d\u53f0",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "seoTitle",
      title: "SEO \u6a19\u984c",
      type: "string",
    }),
    defineField({
      name: "seoDescription",
      title: "SEO \u63cf\u8ff0",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "ogImage",
      title: "\u793e\u7fa4\u5206\u4eab\u5716\u7247",
      type: "image",
      options: { hotspot: true },
    }),
  ],
});
