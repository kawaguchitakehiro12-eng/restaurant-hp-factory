import type { Metadata } from "next";
import { Cormorant_Garamond, Shippori_Antique_B1, Zen_Old_Mincho } from "next/font/google";
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

export const metadata: Metadata = {
  title: "宵月 | 西麻布の高級和風居酒屋",
  description:
    "西麻布の路地奥に佇む、完全予約制の高級和風居酒屋。会食の席で語られる、わずか八席のみの隠れ家。",
  openGraph: {
    title: "宵月 | 西麻布",
    description: "旬を紡ぐ、大人の隠れ家",
    type: "website",
    locale: "ja_JP",
  },
};

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
