import type { Metadata } from "next";
import HomeRoute from "../components/home/HomeRoute";
import { getHomeSlides } from "../lib/sanity/data";

export const metadata: Metadata = {
  title: "KAKU Photography",
  description: "Light reveals. Shadow remembers.",
  openGraph: {
    title: "KAKU Photography",
    description: "Light reveals. Shadow remembers.",
  },
};

export default async function Home() {
  const slides = await getHomeSlides();

  return <HomeRoute slides={slides} />;
}
