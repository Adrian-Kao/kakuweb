import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import PhotoFileExplorer from "./sanity/components/PhotoFileExplorer";
import { schemaTypes } from "./sanity/schemaTypes";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "kakuweb";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export default defineConfig({
  name: "kaku-portfolio",
  title: "KAKU 攝影作品後台",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .id("photo-workspace")
          .title("攝影作品管理")
          .items([
            S.listItem()
              .id("projectExplorer")
              .title("作品管理")
              .child(
                S.component(PhotoFileExplorer)
                  .id("projectExplorerPane")
                  .title("作品管理"),
              ),
            S.listItem()
              .id("homepageCarousel")
              .title("首頁輪播")
              .child(
                S.document()
                  .schemaType("homepageCarousel")
                  .documentId("homepageCarousel")
                  .id("homepageCarouselDocument")
                  .title("首頁輪播"),
              ),
            S.listItem()
              .id("portfolioGallery")
              .title("Portfolio 管理")
              .child(
                S.document()
                  .schemaType("portfolioGallery")
                  .documentId("portfolioGallery")
                  .id("portfolioGalleryDocument")
                  .title("Portfolio 管理"),
              ),
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
  },
});
