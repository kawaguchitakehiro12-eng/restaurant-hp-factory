import type { Metadata } from "next";
import { DEFAULT_PUBLIC_METADATA, resolveSiteBaseUrl } from "@/lib/stores/store-seo";
import "./globals.css";

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
    <html lang="ja" className="h-full">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
