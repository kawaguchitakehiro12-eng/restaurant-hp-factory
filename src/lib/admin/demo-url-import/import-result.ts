import type { DemoImportedMenu,DemoImportedPhoto,DemoUrlImportInput,DemoUrlImportResult } from "@/types/demo-url-import";
import { generateId } from "@/lib/admin/form-utils";
import { genreToBusinessType,suggestTemplateFromGenre } from "@/lib/admin/demo-url-import/business-type";
import { normalizeImageUrlForDedup } from "@/lib/admin/demo-url-import/image-filter";
import type { PartialImportData } from "@/lib/admin/demo-url-import/parsers";
export function countPhotosBySource(photos:DemoImportedPhoto[]){return {tabelog:photos.filter(p=>p.source==="tabelog").length,instagram:photos.filter(p=>p.source==="instagram").length,official:photos.filter(p=>p.source==="official").length,total:photos.length};}
export type DemoImportStreamEvent =
  | { type: "phase"; message: string }
  | {
      type: "partial";
      phase: "store" | "photos-initial" | "photos-more";
      data: PartialImportData;
    }
  | { type: "complete"; result: DemoUrlImportResult }
  | { type: "error"; message: string };

export function mergePartial(target: PartialImportData, source: PartialImportData): void {
  const stringFields = [
    "storeName",
    "genre",
    "address",
    "phone",
    "businessHours",
    "closedDays",
    "access",
    "budget",
    "seats",
    "paymentMethods",
    "smokingPolicy",
    "parking",
    "reservationUrl",
    "instagramUrl",
    "officialUrl",
  ] as const;

  for (const key of stringFields) {
    if (source[key] && !target[key]) target[key] = source[key];
  }

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
    for (const note of source.notes) {
      if (!target.notes.includes(note)) target.notes.push(note);
    }
  }
}

export function buildExtractedFields(data: PartialImportData): string[] {
  const fields: string[] = [];
  const keys = [
    "storeName",
    "genre",
    "address",
    "phone",
    "businessHours",
    "closedDays",
    "access",
    "budget",
    "seats",
    "paymentMethods",
    "smokingPolicy",
    "parking",
    "reservationUrl",
    "instagramUrl",
    "officialUrl",
  ] as const;
  for (const key of keys) {
    if (data[key]) fields.push(key);
  }
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

export function buildImportResult(
  merged: PartialImportData,
  input: DemoUrlImportInput,
  phase: DemoUrlImportResult["importPhase"] = "complete"
): DemoUrlImportResult {
  const instagram = input.instagramUrl.trim();
  const official = input.officialUrl?.trim() ?? "";

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

  if (instagram && !extractedFields.includes("instagramUrl")) {
    extractedFields.push("instagramUrl");
  }
  if (official && !extractedFields.includes("officialUrl")) {
    extractedFields.push("officialUrl");
  }

  return {
    storeName: merged.storeName ?? "",
    genre,
    businessType,
    suggestedTemplateId: suggestTemplateFromGenre(genre),
    address: merged.address ?? "",
    phone: merged.phone ?? "",
    businessHours: merged.businessHours ?? "",
    closedDays: merged.closedDays ?? "",
    access: merged.access ?? "",
    budget: merged.budget ?? "",
    seats: merged.seats ?? "",
    paymentMethods: merged.paymentMethods ?? "",
    smokingPolicy: merged.smokingPolicy ?? "",
    parking: merged.parking ?? "",
    instagramUrl: merged.instagramUrl || instagram,
    officialUrl: merged.officialUrl || official,
    reservationUrl: merged.reservationUrl || official,
    menus,
    photos,
    photoStats,
    extractedFields,
    sourceUrls: input,
    fetchNotes: merged.notes ?? [],
    importPhase: phase,
  };
}

/** クライアント側: PartialImportData をマージして DemoUrlImportResult を更新 */
export function mergeImportResult(
  current: DemoUrlImportResult | null,
  input: DemoUrlImportInput,
  partial: PartialImportData,
  phase: Extract<DemoImportStreamEvent, { type: "partial" }>["phase"]
): DemoUrlImportResult {
  const base: PartialImportData = {
    storeName: current?.storeName,
    genre: current?.genre,
    address: current?.address,
    phone: current?.phone,
    businessHours: current?.businessHours,
    closedDays: current?.closedDays,
    access: current?.access,
    budget: current?.budget,
    seats: current?.seats,
    paymentMethods: current?.paymentMethods,
    smokingPolicy: current?.smokingPolicy,
    parking: current?.parking,
    reservationUrl: current?.reservationUrl,
    instagramUrl: current?.instagramUrl,
    officialUrl: current?.officialUrl,
    menus: current?.menus ?? [],
    photos: current?.photos ?? [],
    notes: current?.fetchNotes ?? [],
  };

  mergePartial(base, partial);
  return buildImportResult(base, input, phase);
}
