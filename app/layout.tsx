import type { Metadata, Viewport } from "next";
import { SitePasswordGate } from "@/components/auth/site-password-gate";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = { title: "Marhba Wassila :) | Petit questionnaire", description: "Un petit questionnaire chaleureux pour mieux te connaître.", applicationName: "Marhba Wassila", robots: { index: false, follow: false } };
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f8f2ee" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="fr"><body><SitePasswordGate><Providers>{children}</Providers></SitePasswordGate></body></html>;
}
