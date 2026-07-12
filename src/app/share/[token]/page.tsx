import type { Metadata } from "next";
import { SharedDemoPageClient } from "@/components/share/SharedDemoPageClient";
import { ShareExpiredPage, ShareNotFoundPage } from "@/components/share/ShareStatusPages";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import { loadSharedDemoPage, peekSharedDemoPage } from "@/lib/share/load-shared-demo";
import { BRAND } from "@/lib/admin/brand";
import "@/app/share/share.css";

type SharePageProps = {
  params: Promise<{ token: string }>;
};

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { token } = await params;
  if (!isSupabaseAdminConfigured()) {
    return { title: `${BRAND.name} Demo Share` };
  }

  try {
    const data = await peekSharedDemoPage(token);
    if (data.status === "found") {
      return {
        title: `${data.demoSite.storeName} | SAKUPAGE Demo`,
        description: `${data.demoSite.storeName}様向けサンプルサイト`,
      };
    }
  } catch {
    /* metadata fallback */
  }

  return { title: `${BRAND.name} Demo Share` };
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params;

  if (!isSupabaseAdminConfigured()) {
    return (
      <ShareNotFoundPage />
    );
  }

  let data;
  try {
    data = await loadSharedDemoPage(token);
  } catch (error) {
    console.error("[SharePage]", error);
    return <ShareNotFoundPage />;
  }

  if (data.status === "expired") {
    return <ShareExpiredPage />;
  }

  if (data.status === "not_found") {
    return <ShareNotFoundPage />;
  }

  return <SharedDemoPageClient data={data} shareToken={token} />;
}
