import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import type { CustomerRepository, DemoSiteRepository } from "@/lib/repositories/types";
import { createSupabaseCustomerRepository } from "@/lib/repositories/supabase/customer-supabase";
import { createSupabaseDemoSiteRepository } from "@/lib/repositories/supabase/demo-site-supabase";

export function getDemoSiteRepository(): DemoSiteRepository {
  if (!isSupabaseAdminConfigured()) {
    throw new Error("Supabase admin is not configured");
  }
  return createSupabaseDemoSiteRepository();
}

export function getCustomerRepository(): CustomerRepository {
  if (!isSupabaseAdminConfigured()) {
    throw new Error("Supabase admin is not configured");
  }
  return createSupabaseCustomerRepository();
}

export { isSupabaseConfigured, isSupabaseAdminConfigured } from "@/lib/supabase/config";
