import {selectManagedShare,summarizeShares} from "@/lib/admin/share-summary";
import { createAdminDbClient } from "@/lib/supabase/admin";
import { generateId } from "@/lib/admin/form-utils";
import {
  computeShareExpiresAt,
  generateShareToken,
  isDemoShareValid,
} from "@/lib/admin/demo-share-utils";
import {
  rowToDemoShare,
  type DemoShareRow,
} from "@/lib/repositories/supabase/demo-share-mappers";
import type { DemoShare, DemoShareSummary, ShareExpiryOption } from "@/types/demo-share";

export type DemoShareRepository = {
  findLatestByDemoSiteId(demoSiteId: string): Promise<DemoShare | null>;
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
  const db = () => createAdminDbClient();

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

    }
    return null;
  }

  return {
    findActiveByDemoSiteId,
    async findLatestByDemoSiteId(demoSiteId) {
      const {data,error}=await db().from("demo_shares").select("*").eq("demo_site_id",demoSiteId).order("created_at",{ascending:false});
      if(error)throw error;
      return selectManagedShare(((data??[]) as DemoShareRow[]).map(rowToDemoShare));
    },

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
      const {error:revokeError}=await db()
        .from("demo_shares")
        .update({ is_active: false, updated_at: now })
        .eq("demo_site_id", demoSiteId)
        .eq("is_active", true);

      if(revokeError)throw revokeError;
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
      // Compare-and-swap avoids lost increments without replaying an ambiguous network failure.
      for (let attempt = 0; attempt < 4; attempt++) {
        const existing = await this.findById(id);
        if (!existing || !isDemoShareValid(existing)) throw new Error("Share unavailable");
        const now = new Date().toISOString();
        const { data, error } = await db().from("demo_shares")
          .update({view_count:existing.viewCount+1,first_viewed_at:existing.firstViewedAt??now,last_viewed_at:now,updated_at:now})
          .eq("id",id).eq("is_active",true).eq("view_count",existing.viewCount)
          .eq("updated_at",existing.updatedAt).select("*").maybeSingle();
        if (error) throw error;
        if (data) return rowToDemoShare(data as DemoShareRow);
      }
      throw new Error("Share view update conflicted; no automatic network retry");
    },

    async getSummariesForSites(demoSiteIds) {
      if (demoSiteIds.length === 0) return {};

      const { data, error } = await db()
        .from("demo_shares")
        .select("*")
        .in("demo_site_id", demoSiteIds)
        .order("created_at", { ascending: false });
      if (error) throw error;

      return summarizeShares(demoSiteIds, ((data??[]) as DemoShareRow[]).map(rowToDemoShare));
    },
  };
}

export function getDemoShareRepository(): DemoShareRepository {
  return createSupabaseDemoShareRepository();
}
