import type { Metadata } from "next";
import { Cormorant_Garamond, Noto_Sans_JP, Playfair_Display } from "next/font/google";
import { getStoreBySlug } from "@/data/stores";
import { isPublished } from "@/lib/stores/helpers";
import {
  buildStoreSeoMetadata,
  DEFAULT_PUBLIC_METADATA,
  resolveSiteBaseUrl,
  storeRecordToSeoInput,
} from "@/lib/stores/store-seo";
import "./bar.css";

const SLUG = "amber";

const notoSans = Noto_Sans_JP({
  variable: "--font-bar-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-bar-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-bar-en",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const store = getStoreBySlug(SLUG);
  if (!store || !isPublished(store)) return DEFAULT_PUBLIC_METADATA;

  const baseUrl = await resolveSiteBaseUrl();
  return buildStoreSeoMetadata(
    storeRecordToSeoInput(store, { canonicalPath: "/bar" }),
    baseUrl
  );
}

export default function BarLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={`${notoSans.variable} ${playfair.variable} ${cormorant.variable}`}>
      {children}
    </div>
  );
}
