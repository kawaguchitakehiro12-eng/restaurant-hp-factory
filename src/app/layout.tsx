import type { Metadata } from "next";
import { Cormorant_Garamond, Shippori_Antique_B1, Zen_Old_Mincho } from "next/font/google";
import { DEFAULT_PUBLIC_METADATA, resolveSiteBaseUrl } from "@/lib/stores/store-seo";
import "./globals.css";

const shipporiAntique = Shippori_Antique_B1({
  variable: "--font-shippori",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const zenOldMincho = Zen_Old_Mincho({
  variable: "--font-zen",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = await resolveSiteBaseUrl();
  return {
    ...DEFAULT_PUBLIC_METADATA,
    metadataBase: new URL(baseUrl),
    title: {
      default: DEFAULT_PUBLIC_METADATA.title as string,
      template: "%s",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${shipporiAntique.variable} ${zenOldMincho.variable} ${cormorant.variable} h-full`}
    >
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
