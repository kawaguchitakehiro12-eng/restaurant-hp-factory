import { createAdminClient } from "@/lib/supabase/admin";
import type { DemoSiteRepository } from "@/lib/repositories/types";
import {
  demoSiteToRow,
  extractContentFromRow,
  mergeContentPatch,
  rowToDemoSite,
  type DemoSiteWithContentRow,
} from "@/lib/repositories/supabase/mappers";
import { extractPhotosFromContent } from "@/lib/repositories/supabase/photo-sync";
import type { DemoSite } from "@/types/demo";
import type { DemoSiteContent } from "@/types/demo-content";
import { ensureDemoContent } from "@/types/demo-content";
import { todayIso } from "@/lib/admin/form-utils";

const SITE_SELECT = "*, store_content(content, site_id, updated_at)";

export function createSupabaseDemoSiteRepository(): DemoSiteRepository {
  const db = () => createAdminClient();

  async function rowToSite(row: DemoSiteWithContentRow): Promise<DemoSite> {
    return rowToDemoSite(row, extractContentFromRow(row));
  }

  async function syncPhotos(siteId: string, content: DemoSiteContent): Promise<void> {
    const client = db();
    await client.from("photos").delete().eq("site_id", siteId);
    const photos = extractPhotosFromContent(siteId, content);
    if (photos.length > 0) {
      const { error } = await client.from("photos").insert(photos);
      if (error) throw error;
    }
  }

  async function upsertContent(siteId: string, content: DemoSiteContent): Promise<void> {
    const client = db();
    const { error } = await client.from("store_content").upsert({
      site_id: siteId,
      content: ensureDemoContent(content),
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
    await syncPhotos(siteId, content);
  }

  return {
    async list() {
      const { data, error } = await db()
        .from("demo_sites")
        .select(SITE_SELECT)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return Promise.all((data as DemoSiteWithContentRow[]).map(rowToSite));
    },

    async findById(id) {
      const { data, error } = await db()
        .from("demo_sites")
        .select(SITE_SELECT)
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return rowToSite(data as DemoSiteWithContentRow);
    },

    async findBySlug(slug) {
      const { data, error } = await db()
        .from("demo_sites")
        .select(SITE_SELECT)
        .ilike("store_slug", slug)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return rowToSite(data as DemoSiteWithContentRow);
    },

    async create(site) {
      const row = demoSiteToRow(site);
      const { error: siteError } = await db().from("demo_sites").insert(row);
      if (siteError) throw siteError;
      if (site.content) {
        await upsertContent(site.id, site.content);
      }
      return (await this.findById(site.id)) ?? site;
    },

    async update(site) {
      const row = demoSiteToRow(site);
      const { error } = await db().from("demo_sites").update(row).eq("id", site.id);
      if (error) throw error;
      if (site.content) {
        await upsertContent(site.id, site.content);
      }
      return (await this.findById(site.id)) ?? site;
    },

    async updateContent(slug, patch) {
      const current = await this.findBySlug(slug);
      if (!current) return null;

      const merged = mergeContentPatch(ensureDemoContent(current.content), patch);
      const updated: DemoSite = {
        ...current,
        content: merged,
        lastUpdatedAt: todayIso(),
      };

      await this.update(updated);
      return updated;
    },

    async delete(id) {
      const { error } = await db().from("demo_sites").delete().eq("id", id);
      if (error) throw error;
    },

    async seedIfEmpty(sites) {
      const { count, error } = await db()
        .from("demo_sites")
        .select("id", { count: "exact", head: true });
      if (error) throw error;
      if ((count ?? 0) > 0) return;

      for (const site of sites) {
        await this.create(site);
      }
    },
  };
}
