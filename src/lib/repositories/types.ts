import type { CustomerAccount } from "@/types/admin";
import type { DemoSite } from "@/types/demo";
import type { DemoSiteContent } from "@/types/demo-content";

export type DemoSiteRepository = {
  list(): Promise<DemoSite[]>;
  findById(id: string): Promise<DemoSite | null>;
  findBySlug(slug: string): Promise<DemoSite | null>;
  create(site: DemoSite): Promise<DemoSite>;
  update(site: DemoSite): Promise<DemoSite>;
  updateContent(slug: string, patch: Partial<DemoSiteContent>): Promise<DemoSite | null>;
  delete(id: string): Promise<void>;
  seedIfEmpty(sites: DemoSite[]): Promise<void>;
};

export type CustomerRepository = {
  list(): Promise<CustomerAccount[]>;
  findById(id: string): Promise<CustomerAccount | null>;
  upsert(customer: CustomerAccount): Promise<CustomerAccount>;
  delete(id: string): Promise<void>;
  linkAuthUser(customerId: string, authUserId: string): Promise<void>;
};
