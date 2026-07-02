import { defineField, defineType } from "sanity";

export const projectImageType = defineType({
  name: "projectImage",
  title: "\u4f5c\u54c1\u7167\u7247",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "\u7167\u7247",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "isCover",
      title: "\u8a2d\u70ba\u5c01\u9762",
      description: "\u5728\u7167\u7247\u9810\u89bd\u88e1\u52fe\u9078\u4e00\u5f35\u4f5c\u70ba Gallery \u5c01\u9762\u3002\u82e5\u591a\u5f35\u88ab\u52fe\u9078\uff0c\u524d\u53f0\u6703\u4f7f\u7528\u7b2c\u4e00\u5f35\u3002",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "alt",
      title: "\u5716\u7247\u66ff\u4ee3\u6587\u5b57",
      description: "\u7d66 SEO \u8207\u7121\u969c\u7919\u95b1\u8b80\u4f7f\u7528\uff0c\u53ef\u7c21\u77ed\u63cf\u8ff0\u7167\u7247\u5167\u5bb9\u3002",
      type: "string",
    }),
    defineField({
      name: "caption",
      title: "\u7167\u7247\u8aaa\u660e",
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
        title: isCover ? "\u5c01\u9762\u7167\u7247" : title || "\u4f5c\u54c1\u7167\u7247",
        subtitle: isCover ? "\u6b64\u7167\u7247\u6703\u4f5c\u70ba Gallery \u5c01\u9762" : "\u4f5c\u54c1\u7167\u7247",
        media,
      };
    },
  },
});

export const projectType = defineType({
  name: "project",
  title: "Projects",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "\u4f5c\u54c1\u96c6\u540d\u7a31",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "\u4f5c\u54c1\u96c6\u7db2\u5740",
      description: "\u4f8b\u5982 portrait-study \u6703\u7522\u751f /gallery/portrait-study\u3002",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "galleryImages",
      title: "\u6574\u7d44\u4f5c\u54c1\u7167\u7247",
      description: "\u53ef\u4e00\u6b21\u4e0a\u50b3\u591a\u5f35\u7167\u7247\u3002\u4e0a\u50b3\u5f8c\uff0c\u5728\u5716\u7247\u9810\u89bd\u4e2d\u52fe\u9078\u300c\u8a2d\u70ba\u5c01\u9762\u300d\u3002",
      type: "array",
      of: [{ type: "projectImage" }],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "categories",
      title: "\u4f5c\u54c1\u5206\u985e",
      description: "\u9078\u64c7\u9019\u7d44\u4f5c\u54c1\u5c6c\u65bc\u54ea\u4e9b\u5206\u985e\u3002",
      type: "array",
      of: [{ type: "reference", to: [{ type: "category" }] }],
    }),
    defineField({
      name: "description",
      title: "\u4f5c\u54c1\u4ecb\u7d39",
      type: "text",
      rows: 5,
    }),
    defineField({
      name: "shootingDate",
      title: "\u62cd\u651d\u65e5\u671f",
      type: "date",
    }),
    defineField({
      name: "location",
      title: "\u62cd\u651d\u5730\u9ede",
      type: "string",
    }),
    defineField({
      name: "tags",
      title: "\u6a19\u7c64",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
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
      description: "\u82e5\u672a\u8a2d\u5b9a\uff0c\u524d\u53f0\u6703\u4f7f\u7528\u4f5c\u54c1\u5c01\u9762\u7167\u7247\u3002",
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
