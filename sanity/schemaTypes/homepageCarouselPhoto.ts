import { defineField, defineType } from "sanity";
import ProjectImagePicker from "../components/ProjectImagePicker";

export const carouselItemType = defineType({
  name: "carouselItem",
  title: "首頁輪播照片",
  type: "object",
  fields: [
    defineField({
      name: "project",
      title: "來源作品",
      description: "先選擇照片所屬的作品集。",
      type: "reference",
      to: [{ type: "project" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "selectedImageKey",
      title: "從作品中挑選照片",
      description: "選擇作品後，下面會顯示該作品已上傳的照片縮圖。",
      type: "string",
      components: {
        input: ProjectImagePicker,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "caption",
      title: "輪播說明",
      type: "string",
    }),
    defineField({
      name: "order",
      title: "排序",
      description: "數字越小越前面，也可以拖曳輪播清單調整順序。",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "isVisible",
      title: "顯示在首頁",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "caption",
      projectTitle: "project.title",
      isVisible: "isVisible",
    },
    prepare({ title, projectTitle, isVisible }) {
      return {
        title: title || projectTitle || "首頁輪播照片",
        subtitle: isVisible ? "顯示在首頁" : "已隱藏",
      };
    },
  },
});

export const homepageCarouselType = defineType({
  name: "homepageCarousel",
  title: "首頁輪播",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "管理頁名稱",
      type: "string",
      initialValue: "首頁輪播",
      readOnly: true,
    }),
    defineField({
      name: "carouselItems",
      title: "輪播照片清單",
      description: "進入後新增輪播照片，選擇 Project，再從該 Project 的照片中挑一張。",
      type: "array",
      of: [{ type: "carouselItem" }],
    }),
  ],
});
