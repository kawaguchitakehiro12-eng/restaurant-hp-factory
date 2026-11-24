import { NextResponse } from "next/server";
import { requireSupabaseAdmin } from "@/lib/api/supabase-route";
import { loadSharedDemoPage } from "@/lib/share/load-shared-demo";

export const dynamic = "force-dynamic";

function publicJson(body:unknown,init:ResponseInit={}){return NextResponse.json(body,{...init,headers:{"Cache-Control":"no-store, max-age=0","X-Robots-Tag":"noindex, nofollow"}});}

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const blocked = requireSupabaseAdmin();
  if (blocked) {blocked.headers.set("Cache-Control","no-store");return blocked;}

  const { token } = await context.params;
  try {
    const data = await loadSharedDemoPage(token);

    if (data.status === "expired") {
      return publicJson({ status: "expired" });
    }
    if (data.status === "not_found") {
      return publicJson({ status: "not_found" }, { status: 404 });
    }

    return publicJson({
      status: "found",
      prospectLabel: data.prospectLabel,
      resolution: {
        status: "found",
        store: data.store,
        sampleFlags: data.sampleFlags,
        heroFit: data.heroFit,
        heroObjectPosition: data.heroObjectPosition,
      },
    });
  } catch {
    console.error("[GET /api/public/share/[token]]");
    return publicJson({ error: "Failed to load shared site" }, { status: 500 });
  }
}
