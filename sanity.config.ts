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
              .id("photoFileExplorer")
              .title("檔案總覽")
              .child(
                S.component(PhotoFileExplorer)
                  .id("photoFileExplorerPane")
                  .title("檔案總覽"),
              ),
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
                  .id("homepageCarousel")
                  .title("首頁輪播"),
              ),
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
  },
});
