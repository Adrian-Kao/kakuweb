"use client";

import { NextStudio } from "next-sanity/studio";
import config from "../../../sanity.config";
import "./studio-overrides.css";

export default function Studio() {
  return <NextStudio config={config} />;
}
