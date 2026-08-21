import type { Metadata } from "next";
import PortfolioGallery from "../../components/portfolio/PortfolioGallery";
import { getPortfolioPhotos } from "../../lib/sanity/data";

export const metadata: Metadata = {
  title: "Portfolio | KAKU Photography",
  description: "Selected photographs by KAKU Photography.",
  openGraph: {
    title: "Portfolio | KAKU Photography",
    description: "Selected photographs by KAKU Photography.",
  },
};

export default async function PortfolioPage() {
  const photos = await getPortfolioPhotos();

  return <PortfolioGallery photos={photos} />;
}
