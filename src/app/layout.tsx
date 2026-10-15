import type { Metadata } from "next";
import { Hind_Siliguri, Inter, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { SITE_URL } from "@/lib/config";
import { getSettings } from "@/lib/settings";
import { DEFAULT_FAVICON } from "@/lib/site-settings";

// Bangla and Latin glyphs in one font, so mixed-language titles render cleanly.
const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["latin", "bengali"],
  weight: ["400", "500", "600", "700"],
});

// Amiami Post type pairing: Space Grotesk for headlines and kickers, Inter for reading text.
const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"], weight: ["500", "600", "700"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

// Name, description and tab icon come from the dashboard's Settings page.
export async function generateMetadata(): Promise<Metadata> {
  const { siteName, tagline, faviconUrl } = await getSettings();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: siteName, template: `%s | ${siteName}` },
    description: tagline,
    icons: {
      icon: faviconUrl,
      apple: faviconUrl === DEFAULT_FAVICON ? "/apple-icon.png" : faviconUrl,
    },
  };
}

// Content changes the moment the dashboard saves it, so never serve a build-time snapshot.
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${hindSiliguri.variable} ${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
