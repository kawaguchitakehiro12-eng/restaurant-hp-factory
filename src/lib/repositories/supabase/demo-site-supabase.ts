import { createAdminDbClient } from "@/lib/supabase/admin";
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
import {contractHasEnded} from '@/lib/operations/visibility';

function unconfirmedSave():never{throw new Error('保存後の内容を確認できません。再読み込みで保存結果を確認してください。自動再試行はしていません。');}
const SITE_SELECT = "*, store_content(content, site_id, updated_at)";

export function createSupabaseDemoSiteRepository(): DemoSiteRepository {
  const db = () => createAdminDbClient();

  async function rowToSite(row: DemoSiteWithContentRow): Promise<DemoSite> {
    const site={...rowToDemoSite(row, extractContentFromRow(row)),contentRevision:(Array.isArray(row.store_content)?row.store_content[0]:row.store_content)?.updated_at??null};
    return await contractHasEnded(row.id)?{...site,publishStatus:'suspended',siteContractStatus:'suspended'}:site;
  }

  async function syncPhotos(siteId: string, content: DemoSiteContent): Promise<void> {
    const client = db();
    const {error:deleteError}=await client.from("photos").delete().eq("site_id", siteId);
    if(deleteError)throw deleteError;
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
      if(process.env.NODE_ENV==="production"&&process.env.OPERATOR_ATOMIC_WRITES_ENABLED!=="true")throw new Error("Production operator saves require the approved atomic-save RPC.");
      if(process.env.OPERATOR_ATOMIC_WRITES_ENABLED==="true"){
        const {error}=await db().rpc("save_operator_demo_v1",{p_site:demoSiteToRow(site),p_content:site.content?ensureDemoContent(site.content):null,p_photos:site.content?extractPhotosFromContent(site.id,site.content):null,p_create:true,p_expected_updated_at:null});
        if(error)throw error;return (await this.findById(site.id))??unconfirmedSave();
      }
      const row = demoSiteToRow(site);
      const { error: siteError } = await db().from("demo_sites").insert(row);
      if (siteError) throw siteError;
      if (site.content) {
        await upsertContent(site.id, site.content);
      }
      return (await this.findById(site.id)) ?? unconfirmedSave();
    },

    async update(site) {
      if(process.env.NODE_ENV==="production"&&process.env.OPERATOR_ATOMIC_WRITES_ENABLED!=="true")throw new Error("Production operator saves require the approved atomic-save RPC.");
      if(process.env.OPERATOR_ATOMIC_WRITES_ENABLED==="true"){
        const {error}=await db().rpc("save_operator_demo_v1",{p_site:demoSiteToRow(site),p_content:site.content?ensureDemoContent(site.content):null,p_photos:site.content?extractPhotosFromContent(site.id,site.content):null,p_create:false,p_expected_updated_at:site.contentRevision??null});
        if(error)throw error;return (await this.findById(site.id))??unconfirmedSave();
      }
      const row = demoSiteToRow(site);
      const { error } = await db().from("demo_sites").update(row).eq("id", site.id);
      if (error) throw error;
      if (site.content) {
        await upsertContent(site.id, site.content);
      }
      return (await this.findById(site.id)) ?? unconfirmedSave();
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

      return this.update(updated);
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
