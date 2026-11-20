import type { DemoShare, DemoShareSummary } from "@/types/demo-share";

export type DemoShareRow = {
  id: string;
  demo_site_id: string;
  share_token: string;
  is_active: boolean;
  expires_at: string | null;
  first_viewed_at: string | null;
  view_count: number;
  last_viewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export function rowToDemoShare(row: DemoShareRow): DemoShare {
  return {
    id: row.id,
    demoSiteId: row.demo_site_id,
    shareToken: row.share_token,
    isActive: row.is_active,
    expiresAt: row.expires_at,
    firstViewedAt: row.first_viewed_at,
    viewCount: row.view_count,
    lastViewedAt: row.last_viewed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function demoShareToRow(
  share: DemoShare
): DemoShareRow {
  return {
    id: share.id,
    demo_site_id: share.demoSiteId,
    share_token: share.shareToken,
    is_active: share.isActive,
    expires_at: share.expiresAt,
    first_viewed_at: share.firstViewedAt,
    view_count: share.viewCount,
    last_viewed_at: share.lastViewedAt,
    created_at: share.createdAt,
    updated_at: share.updatedAt,
  };
}

export function rowToSummary(row: DemoShareRow): DemoShareSummary {
  return {
    demoSiteId: row.demo_site_id,
    hasActiveShare: row.is_active,
    activeShareId: row.is_active ? row.id : null,
    viewCount: row.view_count,
    firstViewedAt: row.first_viewed_at,
    lastViewedAt: row.last_viewed_at,
  };
}
