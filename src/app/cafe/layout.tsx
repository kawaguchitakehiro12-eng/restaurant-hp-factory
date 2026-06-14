import type { Metadata } from "next";
import { Jost, Noto_Sans_JP, Playfair_Display } from "next/font/google";
import "./cafe.css";

const notoSans = Noto_Sans_JP({
  variable: "--font-cafe-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-cafe-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-cafe-en",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "nuée | 表参道のスペシャルティカフェ",
  description:
    "光に包まれる、午後の余白。表参道に佇む白を基調としたスペシャルティカフェ「nuée」。",
  openGraph: {
    title: "nuée | 表参道",
    description: "光に包まれる、午後の余白",
    type: "website",
    locale: "ja_JP",
  },
};

export default function CafeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={`${notoSans.variable} ${playfair.variable} ${jost.variable}`}>
      {children}
    </div>
  );
}
