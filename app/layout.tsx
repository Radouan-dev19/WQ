import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = { title: "Marhba Wasilla :) | Petit questionnaire", description: "Un petit questionnaire chaleureux pour mieux te connaître.", applicationName: "Marhba Wasilla" };
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f8f2ee" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="fr"><body><Providers>{children}</Providers></body></html>;
}

