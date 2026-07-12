import { createAdminClient } from "@/lib/supabase/admin";
import { generateId } from "@/lib/admin/form-utils";
import {
  computeShareExpiresAt,
  generateShareToken,
  isDemoShareValid,
} from "@/lib/admin/demo-share-utils";
import {
  rowToDemoShare,
  rowToSummary,
  type DemoShareRow,
} from "@/lib/repositories/supabase/demo-share-mappers";
import type { DemoShare, DemoShareSummary, ShareExpiryOption } from "@/types/demo-share";

export type DemoShareRepository = {
  findActiveByDemoSiteId(demoSiteId: string): Promise<DemoShare | null>;
  findByToken(token: string): Promise<DemoShare | null>;
  findById(id: string): Promise<DemoShare | null>;
  createOrReuse(demoSiteId: string, expiryOption: ShareExpiryOption): Promise<DemoShare>;
  regenerate(demoSiteId: string, expiryOption: ShareExpiryOption): Promise<DemoShare>;
  revoke(id: string): Promise<void>;
  extend(id: string, expiryOption: ShareExpiryOption): Promise<DemoShare>;
  recordView(id: string): Promise<DemoShare>;
  getSummariesForSites(demoSiteIds: string[]): Promise<Record<string, DemoShareSummary>>;
};

export function createSupabaseDemoShareRepository(): DemoShareRepository {
  const db = () => createAdminClient();

  async function findActiveByDemoSiteId(demoSiteId: string): Promise<DemoShare | null> {
    const { data, error } = await db()
      .from("demo_shares")
      .select("*")
      .eq("demo_site_id", demoSiteId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    const rows = (data ?? []) as DemoShareRow[];
    for (const row of rows) {
      const share = rowToDemoShare(row);
      if (isDemoShareValid(share)) return share;
      if (share.expiresAt && new Date(share.expiresAt).getTime() < Date.now()) {
        await db()
          .from("demo_shares")
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq("id", share.id);
      }
    }
    return null;
  }

  return {
    findActiveByDemoSiteId,

    async findByToken(token) {
      const { data, error } = await db()
        .from("demo_shares")
        .select("*")
        .eq("share_token", token)
        .maybeSingle();
      if (error) throw error;
      return data ? rowToDemoShare(data as DemoShareRow) : null;
    },

    async findById(id) {
      const { data, error } = await db()
        .from("demo_shares")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data ? rowToDemoShare(data as DemoShareRow) : null;
    },

    async createOrReuse(demoSiteId, expiryOption) {
      const existing = await findActiveByDemoSiteId(demoSiteId);
      if (existing) return existing;

      const now = new Date().toISOString();
      const share: DemoShare = {
        id: generateId("share"),
        demoSiteId,
        shareToken: generateShareToken(),
        isActive: true,
        expiresAt: computeShareExpiresAt(expiryOption),
        firstViewedAt: null,
        viewCount: 0,
        lastViewedAt: null,
        createdAt: now,
        updatedAt: now,
      };

      const { error } = await db().from("demo_shares").insert({
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
      });
      if (error) throw error;
      return share;
    },

    async regenerate(demoSiteId, expiryOption) {
      const now = new Date().toISOString();
      await db()
        .from("demo_shares")
        .update({ is_active: false, updated_at: now })
        .eq("demo_site_id", demoSiteId)
        .eq("is_active", true);

      const share: DemoShare = {
        id: generateId("share"),
        demoSiteId,
        shareToken: generateShareToken(),
        isActive: true,
        expiresAt: computeShareExpiresAt(expiryOption),
        firstViewedAt: null,
        viewCount: 0,
        lastViewedAt: null,
        createdAt: now,
        updatedAt: now,
      };

      const { error } = await db().from("demo_shares").insert({
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
      });
      if (error) throw error;
      return share;
    },

    async revoke(id) {
      const { error } = await db()
        .from("demo_shares")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },

    async extend(id, expiryOption) {
      const expiresAt = computeShareExpiresAt(expiryOption);
      const { data, error } = await db()
        .from("demo_shares")
        .update({
          is_active: true,
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      return rowToDemoShare(data as DemoShareRow);
    },

    async recordView(id) {
      const existing = await this.findById(id);
      if (!existing) throw new Error("Share not found");

      const now = new Date().toISOString();
      const { data, error } = await db()
        .from("demo_shares")
        .update({
          view_count: existing.viewCount + 1,
          first_viewed_at: existing.firstViewedAt ?? now,
          last_viewed_at: now,
          updated_at: now,
        })
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      return rowToDemoShare(data as DemoShareRow);
    },

    async getSummariesForSites(demoSiteIds) {
      if (demoSiteIds.length === 0) return {};

      const { data, error } = await db()
        .from("demo_shares")
        .select("*")
        .in("demo_site_id", demoSiteIds)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const result: Record<string, DemoShareSummary> = {};
      for (const id of demoSiteIds) {
        result[id] = {
          demoSiteId: id,
          hasActiveShare: false,
          activeShareId: null,
          viewCount: 0,
          firstViewedAt: null,
          lastViewedAt: null,
        };
      }

      for (const row of (data ?? []) as DemoShareRow[]) {
        const siteId = row.demo_site_id;
        const current = result[siteId];
        if (!current) continue;

        if (row.view_count > current.viewCount) {
          current.viewCount = row.view_count;
          current.firstViewedAt = row.first_viewed_at;
          current.lastViewedAt = row.last_viewed_at;
        }

        const share = rowToDemoShare(row);
        if (isDemoShareValid(share) && !current.hasActiveShare) {
          current.hasActiveShare = true;
          current.activeShareId = row.id;
          current.viewCount = row.view_count;
          current.firstViewedAt = row.first_viewed_at;
          current.lastViewedAt = row.last_viewed_at;
        }
      }

      return result;
    },
  };
}

export function getDemoShareRepository(): DemoShareRepository {
  return createSupabaseDemoShareRepository();
}
