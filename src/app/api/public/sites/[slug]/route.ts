import { NextResponse } from "next/server";
import { requireSupabaseAdmin } from "@/lib/api/supabase-route";
import { getDemoSiteRepository } from "@/lib/repositories";
import {
  isDemoSitePubliclyVisible,
  resolvePublicStoreBySlug,
} from "@/lib/stores/demo-to-store";

export const dynamic = "force-dynamic";

function publicJson(body:unknown,init:ResponseInit={}){return NextResponse.json(body,{...init,headers:{"Cache-Control":"no-store, max-age=0","X-Robots-Tag":"noindex, nofollow"}});}

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const blocked = requireSupabaseAdmin();
  if (blocked) {blocked.headers.set("Cache-Control","no-store");return blocked;}

  const { slug } = await context.params;
  try {
    const site = await getDemoSiteRepository().findBySlug(slug);
    if (!site) {
      return publicJson({
        resolution: { status: "not_found" as const },
        visible: false,
      });
    }

    const resolution = resolvePublicStoreBySlug(slug, [site]);
    return publicJson({
      resolution,
      visible: isDemoSitePubliclyVisible(site),
    });
  } catch {
    console.error("[GET /api/public/sites/[slug]]");
    return publicJson({ error: "Failed to resolve public site" }, { status: 500 });
  }
}
