import { initialDemoSites } from "@/data/admin/demo-mock";
import { getCustomerRepository, getDemoSiteRepository } from "@/lib/repositories";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";

export function requireSupabaseAdmin() {
  if (!isSupabaseAdminConfigured()) {
    return Response.json({ error: "Supabase is not configured" }, { status: 503 });
  }
  return null;
}

export async function seedDemoSitesIfNeeded() {
  const repo = getDemoSiteRepository();
  await repo.seedIfEmpty(initialDemoSites);
}
