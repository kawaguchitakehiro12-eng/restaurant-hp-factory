/**
 * One-time migration: import localStorage demo data into Supabase.
 *
 * Usage (browser console on localhost while logged into admin):
 *
 *   import('./scripts/migrate-localStorage-export.json') // or paste JSON
 *
 * Or run via API after exporting localStorage keys:
 *   sakupage:demo-sites
 *   sakupage:customers
 *
 * POST /api/demo-sites with each site
 * POST /api/customers with each customer
 */

export type LocalStorageExport = {
  demoSites: import("@/types/demo").DemoSite[];
  customers: import("@/types/admin").CustomerAccount[];
};

export function parseLocalStorageExport(raw: string): LocalStorageExport {
  const parsed = JSON.parse(raw) as Partial<LocalStorageExport>;
  return {
    demoSites: Array.isArray(parsed.demoSites) ? parsed.demoSites : [],
    customers: Array.isArray(parsed.customers) ? parsed.customers : [],
  };
}

export async function migrateExportToSupabase(
  exportData: LocalStorageExport,
  baseUrl = ""
): Promise<{ sites: number; customers: number }> {
  let sites = 0;
  let customers = 0;

  for (const customer of exportData.customers) {
    const res = await fetch(`${baseUrl}/api/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customer),
    });
    if (res.ok) customers += 1;
  }

  for (const site of exportData.demoSites) {
    const res = await fetch(`${baseUrl}/api/demo-sites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(site),
    });
    if (res.ok) sites += 1;
  }

  return { sites, customers };
}
