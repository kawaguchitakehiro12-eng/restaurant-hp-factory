import type { DemoSiteFormInput } from "@/types/demo";
import { createEmptyDemoContent } from "@/types/demo-content";
import type {
  DemoPhotoAssignment,
  DemoUrlImportInput,
  DemoUrlImportResult,
} from "@/types/demo-url-import";
import { generateId, normalizeSlug } from "@/lib/admin/form-utils";
import {
  getCachedImport,
  setCachedImport,
} from "@/lib/admin/demo-url-import/import-cache";
import {
  mergeImportResult,
  type DemoImportStreamEvent,
} from "@/lib/admin/demo-url-import/import-service";
import { suggestPhotoAssignment } from "@/lib/admin/demo-url-import/photo-assignment";
import type { ContractTemplateId } from "@/types/demo";

export function validateDemoUrlImportInput(input: DemoUrlImportInput): string | null {
  const tabelog = input.tabelogUrl.trim();
  const instagram = input.instagramUrl.trim();
  const official = input.officialUrl?.trim() ?? "";

  if (!tabelog && !instagram && !official) {
    return "食べログURL、Instagram URL、公式サイトURLのいずれか1つ以上を入力してください";
  }

  const urls = [tabelog, instagram, official].filter(Boolean);
  for (const url of urls) {
    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      return "URLの形式が正しくありません";
    }
  }

  return null;
}

export function displayOrEmpty(value: string | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "（未取得 — 公開時はサンプル表示）";
}

export {
  genreToBusinessType,
  suggestTemplateFromBusinessType,
  suggestTemplateFromGenre,
  getTemplateLabelFromGenre,
} from "@/lib/admin/demo-url-import/business-type";

export { suggestPhotoAssignment } from "@/lib/admin/demo-url-import/photo-assignment";

/** キャッシュ付き・段階表示対応のURL取得 */
export async function fetchDemoImportStream(
  input: DemoUrlImportInput,
  handlers: {
    onPhase?: (message: string) => void;
    onPartial: (result: DemoUrlImportResult) => void;
    onComplete: (result: DemoUrlImportResult) => void;
    onError: (message: string) => void;
  }
): Promise<DemoUrlImportResult> {
  const cached = getCachedImport(input);
  if (cached) {
    handlers.onPhase?.("保存済みデータを読み込みました（24時間以内）");
    const result = { ...cached, fromCache: true, importPhase: "complete" as const };
    handlers.onPartial(result);
    handlers.onComplete(result);
    return result;
  }

  const res = await fetch("/api/admin/demo-import/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok || !res.body) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "情報の取得に失敗しました");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let current: DemoUrlImportResult | null = null;
  let finalResult: DemoUrlImportResult | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n\n");
    buffer = lines.pop() ?? "";

    for (const chunk of lines) {
      const line = chunk.trim();
      if (!line.startsWith("data: ")) continue;
      const event = JSON.parse(line.slice(6)) as DemoImportStreamEvent;

      if (event.type === "phase") {
        handlers.onPhase?.(event.message);
      } else if (event.type === "partial") {
        current = mergeImportResult(current, input, event.data, event.phase);
        handlers.onPartial(current);
      } else if (event.type === "complete") {
        finalResult = event.result;
        setCachedImport(input, event.result);
        handlers.onComplete(event.result);
      } else if (event.type === "error") {
        handlers.onError(event.message);
        throw new Error(event.message);
      }
    }
  }

  if (!finalResult) throw new Error("情報の取得に失敗しました");
  return finalResult;
}

/** @deprecated 一括取得（後方互換） */
export async function fetchDemoImportFromUrls(
  input: DemoUrlImportInput
): Promise<DemoUrlImportResult> {
  return fetchDemoImportStream(input, {
    onPartial: () => {},
    onComplete: () => {},
    onError: (msg) => {
      throw new Error(msg);
    },
  });
}

function photoUrlById(
  photos: DemoUrlImportResult["photos"],
  id: string | null
): string {
  if (!id) return "";
  const photo = photos.find((p) => p.id === id);
  if (!photo || photo.excluded) return "";
  return photo.url;
}

/** 取得結果と写真割り当てをデモ作成フォームへ反映（AI文章は含めない） */
export function applyImportToForm(
  result: DemoUrlImportResult,
  assignment: DemoPhotoAssignment,
  current: DemoSiteFormInput
): DemoSiteFormInput {
  const storeName = result.storeName || current.storeName;
  const sourceUrl =
    result.officialUrl ||
    result.sourceUrls.tabelogUrl ||
    result.sourceUrls.instagramUrl ||
    current.sourceUrl;

  const galleryPhotos = assignment.gallery
    .map((id, i) => {
      const photo = result.photos.find((p) => p.id === id);
      if (!photo || photo.excluded) return null;
      return {
        id: generateId("gallery"),
        url: photo.url,
        alt: photo.alt,
        caption: "",
        sortOrder: i + 1,
      };
    })
    .filter((g): g is NonNullable<typeof g> => g !== null);

  const empty = createEmptyDemoContent();
  const templateId = result.suggestedTemplateId as ContractTemplateId;

  return {
    ...current,
    storeName,
    storeSlug: storeName ? normalizeSlug(storeName) : current.storeSlug,
    businessType: result.businessType || current.businessType,
    sourceUrl,
    address: result.address || current.address,
    phone: result.phone || current.phone,
    templateId,
    content: {
      ...empty,
      basicInfo: {
        ...empty.basicInfo,
        address: result.address,
        phone: result.phone,
        businessHours: result.businessHours,
        closedDays: result.closedDays,
        access: result.access,
        instagramUrl: result.instagramUrl,
        reservationUrl: result.reservationUrl || result.officialUrl,
      },
      photos: {
        hero: photoUrlById(result.photos, assignment.hero),
        exterior: photoUrlById(result.photos, assignment.exterior),
        interior: photoUrlById(result.photos, assignment.interior),
        food: photoUrlById(result.photos, assignment.food),
        gallery: galleryPhotos,
      },
      importedPhotos: result.photos,
      menus: result.menus.map((m, i) => ({
        id: generateId("menu"),
        name: m.name,
        price: m.price,
        description: m.description,
        imageUrl: m.imageUrl,
        visible: true,
        sortOrder: i + 1,
      })),
      topics: [],
    },
  };
}
