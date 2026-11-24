import {
  currentCustomerId,
  getSubscriptionByCustomerId,
} from "@/data/admin/mock";
import { getStoreBySlug } from "@/data/stores";
import type { StoreRecord } from "@/types/store";
import type { StoreSubscription } from "@/types/admin";

export function getCurrentCustomerContext(): {
  subscription: StoreSubscription;
  store: StoreRecord;
} | null {
  const subscription = getSubscriptionByCustomerId(currentCustomerId);
  if (!subscription) return null;

  const store = getStoreBySlug(subscription.storeSlug);
  if (!store) return null;

  return { subscription, store };
}
