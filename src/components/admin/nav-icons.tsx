import type { LucideIcon } from "lucide-react";
import {
  CreditCard,
  FileText,
  Globe,
  Image,
  LayoutDashboard,
  Settings,
  Store,
  Users,
  UtensilsCrossed,
} from "lucide-react";

export const NAV_ICONS = {
  dashboard: LayoutDashboard,
  settings: Settings,
  topics: FileText,
  photos: Image,
  menu: UtensilsCrossed,
  billing: CreditCard,
  customers: Users,
  stores: Store,
  sites: Globe,
} as const satisfies Record<string, LucideIcon>;

export type NavIconName = keyof typeof NAV_ICONS;
