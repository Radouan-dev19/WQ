import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Marhba Wassila",
    short_name: "Marhba",
    description: "Petit questionnaire pour mieux te connaître",
    start_url: `${process.env.PAGES_BASE_PATH ?? ""}/`,
    display: "standalone",
    background_color: "#f8f2ee",
    theme_color: "#f8f2ee",
  };
}
