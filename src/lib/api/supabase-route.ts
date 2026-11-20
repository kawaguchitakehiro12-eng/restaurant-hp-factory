import { initialDemoCustomers, initialDemoSites } from "@/data/admin/demo-mock";
import { getCustomerRepository, getDemoSiteRepository } from "@/lib/repositories";
import { createAdminDbClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";

export function requireSupabaseAdmin() {
  if (!isSupabaseAdminConfigured()) {
    return Response.json({ error: "Supabase is not configured" }, { status: 503 });
  }
  return null;
}

export async function seedDemoSitesIfNeeded() {
  const { count, error } = await createAdminDbClient()
    .from("demo_sites")
    .select("id", { count: "exact", head: true });
  if (error) throw error;
  if ((count ?? 0) > 0) return;

  const customerRepo = getCustomerRepository();
  for (const customer of initialDemoCustomers) {
    await customerRepo.upsert(customer);
  }

  const siteRepo = getDemoSiteRepository();
  await siteRepo.seedIfEmpty(initialDemoSites);
}
