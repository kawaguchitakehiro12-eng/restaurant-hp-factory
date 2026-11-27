import type { CustomerAccount } from "@/types/admin";
import { initialDemoCustomers } from "@/data/admin/demo-mock";

export const CUSTOMERS_STORAGE_KEY = "sakupage:customers";

export function loadCustomersFromStorage(
  fallback: CustomerAccount[] = initialDemoCustomers
): CustomerAccount[] {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as CustomerAccount[];
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function saveCustomersToStorage(customers: CustomerAccount[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
}
