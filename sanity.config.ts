import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import StudioDashboard from "./sanity/components/StudioDashboard";
import { schemaTypes } from "./sanity/schemaTypes";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "kakuweb";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export default defineConfig({
  name: "kaku-portfolio",
  title: "KAKU Photography Studio",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .id("photo-workspace")
          .title("Photo Workspace")
          .items([
            S.listItem()
              .id("dashboard")
              .title("Dashboard")
              .child(S.component(StudioDashboard).id("dashboard").title("Dashboard")),
            S.documentTypeListItem("project").title("Projects"),
            S.listItem()
              .id("homepageCarousel")
              .title("Homepage Carousel")
              .child(
                S.document()
                  .schemaType("homepageCarousel")
                  .documentId("homepageCarousel")
                  .id("homepageCarousel")
                  .title("Homepage Carousel"),
              ),
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
  },
});
