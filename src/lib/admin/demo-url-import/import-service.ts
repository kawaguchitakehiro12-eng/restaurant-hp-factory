import type {
  DemoImportedMenu,
  DemoImportedPhoto,
  DemoUrlImportInput,
  DemoUrlImportResult,
} from "@/types/demo-url-import";
import { generateId } from "@/lib/admin/form-utils";
import { genreToBusinessType } from "@/lib/admin/demo-url-import/business-type";
import { normalizeImageUrlForDedup } from "@/lib/admin/demo-url-import/image-filter";
import {
  countPhotosBySource,
  crawlInstagram,
  crawlOfficialSite,
  crawlTabelog,
} from "@/lib/admin/demo-url-import/source-crawlers";
import type { PartialImportData } from "@/lib/admin/demo-url-import/parsers";

function mergePartial(target: PartialImportData, source: PartialImportData): void {
  if (source.storeName && !target.storeName) target.storeName = source.storeName;
  if (source.genre && !target.genre) target.genre = source.genre;
  if (source.address && !target.address) target.address = source.address;
  if (source.phone && !target.phone) target.phone = source.phone;
  if (source.businessHours && !target.businessHours) target.businessHours = source.businessHours;
  if (source.closedDays && !target.closedDays) target.closedDays = source.closedDays;

  if (source.menus?.length) {
    target.menus = target.menus ?? [];
    for (const menu of source.menus) {
      if (!menu.name.trim()) continue;
      if (target.menus.some((m) => m.name === menu.name)) continue;
      target.menus.push(menu);
    }
  }

  if (source.photos?.length) {
    target.photos = target.photos ?? [];
    const urls = new Set(target.photos.map((p) => normalizeImageUrlForDedup(p.url)));
    for (const photo of source.photos) {
      const key = normalizeImageUrlForDedup(photo.url);
      if (urls.has(key)) continue;
      target.photos.push(photo);
      urls.add(key);
    }
  }

  if (source.notes?.length) {
    target.notes = target.notes ?? [];
    target.notes.push(...source.notes);
  }
}

function buildExtractedFields(data: PartialImportData): string[] {
  const fields: string[] = [];
  if (data.storeName) fields.push("storeName");
  if (data.genre) fields.push("genre");
  if (data.address) fields.push("address");
  if (data.phone) fields.push("phone");
  if (data.businessHours) fields.push("businessHours");
  if (data.closedDays) fields.push("closedDays");
  if (data.menus?.length) fields.push("menus");
  if (data.photos?.length) fields.push("photos");
  return fields;
}

function dedupeMenus(menus: DemoImportedMenu[]): DemoImportedMenu[] {
  const seen = new Set<string>();
  return menus.filter((m) => {
    if (!m.name.trim()) return false;
    if (seen.has(m.name)) return false;
    seen.add(m.name);
    return true;
  });
}

function sortPhotosBySize(photos: DemoImportedPhoto[]): DemoImportedPhoto[] {
  return [...photos].sort((a, b) => {
    const scoreA = estimateFromUrl(a.url);
    const scoreB = estimateFromUrl(b.url);
    return scoreB - scoreA;
  });
}

function estimateFromUrl(url: string): number {
  const dim = url.match(/(\d{3,4})x(\d{3,4})/i);
  if (dim) return parseInt(dim[1], 10) * parseInt(dim[2], 10);
  const m = url.match(/1280|1200|1024|960|800|640|600/);
  if (m) return parseInt(m[0], 10) ** 2;
  return 0;
}

/** サーバー側: URLから取得できる情報のみマージ（AI不使用） */
export async function importDemoFromUrls(
  input: DemoUrlImportInput
): Promise<DemoUrlImportResult> {
  const merged: PartialImportData = {
    menus: [],
    photos: [],
    notes: [],
  };

  const tabelog = input.tabelogUrl.trim();
  const instagram = input.instagramUrl.trim();
  const official = input.officialUrl?.trim() ?? "";

  const tasks: Promise<void>[] = [];

  if (tabelog) {
    tasks.push(
      crawlTabelog(tabelog).then((data) => {
        mergePartial(merged, data);
      })
    );
  }

  if (official) {
    tasks.push(
      crawlOfficialSite(official).then((data) => {
        mergePartial(merged, data);
      })
    );
  }

  if (instagram) {
    tasks.push(
      crawlInstagram(instagram).then((data) => {
        mergePartial(merged, data);
      })
    );
  }

  await Promise.all(tasks);

  const photos = sortPhotosBySize(
    (merged.photos ?? []).map((p) => ({
      ...p,
      id: p.id || generateId("photo"),
    }))
  );

  const photoStats = countPhotosBySource(photos);
  const menus = dedupeMenus(merged.menus ?? []);
  const genre = merged.genre ?? "";
  const businessType = genreToBusinessType(genre);

  const extractedFields = buildExtractedFields(merged);
  if (instagram) extractedFields.push("instagramUrl");
  if (official) extractedFields.push("officialUrl");

  if (extractedFields.length === 0) {
    merged.notes?.push(
      "取得できた情報がありませんでした。URLを確認するか、手入力で作成してください。"
    );
  }

  merged.notes?.push(
    `合計 ${photoStats.total}枚取得（食べログ ${photoStats.tabelog} / Instagram ${photoStats.instagram} / 公式 ${photoStats.official}）`
  );

  return {
    storeName: merged.storeName ?? "",
    genre,
    businessType,
    address: merged.address ?? "",
    phone: merged.phone ?? "",
    businessHours: merged.businessHours ?? "",
    closedDays: merged.closedDays ?? "",
    instagramUrl: instagram,
    officialUrl: official,
    menus,
    photos,
    photoStats,
    extractedFields,
    sourceUrls: input,
    fetchNotes: merged.notes ?? [],
  };
}
