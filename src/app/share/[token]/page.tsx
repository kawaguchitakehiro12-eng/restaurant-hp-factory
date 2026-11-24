import type { Metadata } from "next";
import { SharePublicPage } from "@/components/share/SharePublicPage";
import { ShareNotFoundPage } from "@/components/share/ShareStatusPages";
import { isSupabaseAdminConfigured } from "@/lib/supabase/server-config";
import { peekSharedDemoPage } from "@/lib/share/load-shared-demo";
import { BRAND } from "@/lib/admin/brand";
import "@/app/share/share.css";

export const dynamic = "force-dynamic";
const privacy = {robots:{index:false,follow:false},referrer:"no-referrer" as const};

type SharePageProps = {
  params: Promise<{ token: string }>;
};

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { token } = await params;
  if (!isSupabaseAdminConfigured()) {
    return { ...privacy, title: `${BRAND.name} Demo Share` };
  }

  try {
    const data = await peekSharedDemoPage(token);
    if (data.status === "found") {
      return {
        ...privacy,
        title: `${data.demoSite.storeName} | SAKUPAGE Demo`,
        description: `${data.demoSite.storeName}様向けサンプルサイト`,
      };
    }
  } catch {
    /* metadata fallback */
  }

  return { ...privacy, title: `${BRAND.name} Demo Share` };
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params;

  if (!isSupabaseAdminConfigured()) {
    return <ShareNotFoundPage />;
  }

  return <SharePublicPage shareToken={token} />;
}
