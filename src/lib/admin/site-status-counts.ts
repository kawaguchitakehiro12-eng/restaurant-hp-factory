import type { DemoSite } from "@/types/demo";
import {
  getSiteDisplayStatus,
  type SiteDisplayStatus,
} from "@/lib/admin/site-display-status";

export type SiteStatusCounts = Record<SiteDisplayStatus, number>;

export function computeSiteStatusCounts(demoSites: DemoSite[]): SiteStatusCounts {
  const counts: SiteStatusCounts = {
    demo: 0,
    published: 0,
    suspended: 0,
    lost: 0,
  };

  for (const site of demoSites) {
    const status = getSiteDisplayStatus(site);
    counts[status] += 1;
  }

  return counts;
}
