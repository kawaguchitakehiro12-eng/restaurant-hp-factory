import type { DemoSiteContent } from "@/types/demo-content";

export type CustomerContent = Omit<DemoSiteContent, "importedPhotos">;
export type CustomerSite = {
  id: string;
  slug: string;
  name: string;
  publishStatus: string;
  contractStatus?: string;
  monthlyFee: number | null;
  contractStartDate: string | null;
  minimumTermEndDate: string | null;
  nextBillingDate: string | null;
  billingStatus: string | null;
  content: CustomerContent;
  revision: string | null;
};
