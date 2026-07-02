import { defineField, defineType } from "sanity";

export const carouselItemType = defineType({
  name: "carouselItem",
  title: "\u9996\u9801\u8f2a\u64ad\u9805\u76ee",
  type: "object",
  fields: [
    defineField({
      name: "project",
      title: "\u4f86\u6e90\u4f5c\u54c1\u96c6",
      description: "\u5148\u9078\u64c7\u9019\u5f35\u7167\u7247\u5c6c\u65bc\u54ea\u4e00\u500b\u4f5c\u54c1\u96c6\u3002",
      type: "reference",
      to: [{ type: "project" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "\u8f2a\u64ad\u7167\u7247",
      description: "\u5f9e\u5df2\u4e0a\u50b3\u7684\u5a92\u9ad4\u5eab\u6311\u9078\u7167\u7247\u3002\u5efa\u8b70\u9078\u64c7\u4f86\u6e90\u4f5c\u54c1\u96c6\u88e1\u7684\u7167\u7247\u3002",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "caption",
      title: "\u8f2a\u64ad\u8aaa\u660e",
      description: "\u53ef\u9078\uff0c\u50c5\u4f5c\u5f8c\u53f0\u8fa8\u8b58\u6216\u672a\u4f86\u524d\u53f0\u986f\u793a\u4f7f\u7528\u3002",
      type: "string",
    }),
    defineField({
      name: "order",
      title: "\u6392\u5e8f",
      description: "\u53ef\u7528\u6578\u5b57\u6392\u5e8f\uff0c\u4e5f\u53ef\u76f4\u63a5\u62d6\u66f3\u6b64\u6e05\u55ae\u9806\u5e8f\u3002",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "isVisible",
      title: "\u986f\u793a\u5728\u9996\u9801",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "caption",
      media: "image",
      projectTitle: "project.title",
      isVisible: "isVisible",
    },
    prepare({ title, media, projectTitle, isVisible }) {
      return {
        title: title || projectTitle || "\u9996\u9801\u8f2a\u64ad\u7167\u7247",
        subtitle: isVisible ? "\u986f\u793a\u5728\u9996\u9801" : "\u5df2\u96b1\u85cf",
        media,
      };
    },
  },
});

export const homepageCarouselType = defineType({
  name: "homepageCarousel",
  title: "\u9996\u9801\u8f2a\u64ad",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "\u7ba1\u7406\u9801\u540d\u7a31",
      type: "string",
      initialValue: "\u9996\u9801\u8f2a\u64ad",
      readOnly: true,
    }),
    defineField({
      name: "carouselItems",
      title: "\u8f2a\u64ad\u7167\u7247\u6e05\u55ae",
      description: "\u5148\u5efa\u7acb Project\uff0c\u518d\u5f9e\u4f5c\u54c1\u7167\u7247\u4e2d\u6311\u9078\u9996\u9801\u8f2a\u64ad\u7167\u7247\u3002\u53ef\u62d6\u66f3\u9805\u76ee\u8abf\u6574\u9806\u5e8f\u3002",
      type: "array",
      of: [{ type: "carouselItem" }],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "\u9996\u9801\u8f2a\u64ad",
        subtitle: "\u5f9e\u4f5c\u54c1\u96c6\u4e2d\u6311\u9078\u9996\u9801\u7167\u7247",
      };
    },
  },
});
