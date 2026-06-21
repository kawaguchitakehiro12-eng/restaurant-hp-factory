import type { Metadata } from "next";
import { PublicStorePage } from "@/components/public/PublicStorePage";
import { BRAND } from "@/lib/admin/brand";
import { DEFAULT_PUBLIC_METADATA, resolveSiteBaseUrl } from "@/lib/stores/store-seo";

type SlugPageProps = {
  params: Promise<{ slug: string }>;
};

/** デモサイトは localStorage 参照のため SSR 時は汎用メタのみ。詳細は StoreSeoHead がクライアントで反映 */
export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = await resolveSiteBaseUrl();

  return {
    ...DEFAULT_PUBLIC_METADATA,
    title: `${BRAND.name} Demo`,
    description: `${BRAND.name} — 営業デモサイト`,
    alternates: {
      canonical: `${baseUrl}/${slug}`,
    },
    openGraph: {
      title: `${BRAND.name} Demo`,
      description: `${BRAND.name} — 営業デモサイト`,
      type: "website",
      locale: "ja_JP",
      url: `${baseUrl}/${slug}`,
    },
    twitter: {
      card: "summary",
      title: `${BRAND.name} Demo`,
      description: `${BRAND.name} — 営業デモサイト`,
    },
  };
}

export default async function SlugPage({ params }: SlugPageProps) {
  const { slug } = await params;
  return <PublicStorePage slug={slug} />;
}
