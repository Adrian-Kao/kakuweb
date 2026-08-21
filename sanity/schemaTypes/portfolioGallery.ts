import { defineField, defineType } from "sanity";
import PortfolioImageManager from "../components/PortfolioImageManager";

export const portfolioGalleryType = defineType({
  name: "portfolioGallery",
  title: "Portfolio 管理",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "管理頁名稱",
      type: "string",
      hidden: true,
      readOnly: true,
      initialValue: "Portfolio 管理",
    }),
    defineField({
      name: "images",
      title: "Portfolio 照片",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: false },
        },
      ],
      options: { sortable: true },
      components: {
        input: PortfolioImageManager,
      },
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Portfolio 管理",
        subtitle: "上傳與排序單張作品照片",
      };
    },
  },
});
