import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest { return { name: "Marhba Wasilla", short_name: "Marhba", description: "Petit questionnaire pour mieux te connaître", start_url: "/", display: "standalone", background_color: "#f8f2ee", theme_color: "#f8f2ee" }; }

