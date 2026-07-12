import type { Metadata } from "next";
import { SharePublicPage } from "@/components/share/SharePublicPage";
import { ShareNotFoundPage } from "@/components/share/ShareStatusPages";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import { peekSharedDemoPage } from "@/lib/share/load-shared-demo";
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
    return <ShareNotFoundPage />;
  }

  return <SharePublicPage shareToken={token} />;
}
