/** 共有URLの有効期限オプション */
export type ShareExpiryOption = "7d" | "30d" | "never";

export type DemoShare = {
  id: string;
  demoSiteId: string;
  shareToken: string;
  isActive: boolean;
  expiresAt: string | null;
  firstViewedAt: string | null;
  viewCount: number;
  lastViewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DemoShareSummary = {
  demoSiteId: string;
  hasActiveShare: boolean;
  activeShareId: string | null;
  viewCount: number;
  firstViewedAt: string | null;
  lastViewedAt: string | null;
};

export const SHARE_EXPIRY_OPTIONS: { id: ShareExpiryOption; label: string }[] = [
  { id: "7d", label: "7日間" },
  { id: "30d", label: "30日間" },
  { id: "never", label: "無期限" },
];
