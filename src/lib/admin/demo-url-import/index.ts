import type { DemoSiteFormInput } from "@/types/demo";
import { createEmptyDemoContent } from "@/types/demo-content";
import type {
  DemoPhotoAssignment,
  DemoUrlImportInput,
  DemoUrlImportResult,
} from "@/types/demo-url-import";
import { generateId, normalizeSlug } from "@/lib/admin/form-utils";
import { suggestTemplateFromBusinessType } from "@/lib/admin/demo-url-import/business-type";
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

export { genreToBusinessType, suggestTemplateFromBusinessType } from "@/lib/admin/demo-url-import/business-type";

/** クライアントからスクレイピングAPIを呼び出す */
export async function fetchDemoImportFromUrls(
  input: DemoUrlImportInput
): Promise<DemoUrlImportResult> {
  const res = await fetch("/api/admin/demo-import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "情報の取得に失敗しました");
  }

  return res.json() as Promise<DemoUrlImportResult>;
}

function photoUrlById(
  photos: DemoUrlImportResult["photos"],
  id: string | null
): string {
  if (!id) return "";
  return photos.find((p) => p.id === id)?.url ?? "";
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
      if (!photo) return null;
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

  return {
    ...current,
    storeName,
    storeSlug: storeName ? normalizeSlug(storeName) : current.storeSlug,
    businessType: result.businessType || current.businessType,
    sourceUrl,
    address: result.address || current.address,
    phone: result.phone || current.phone,
    templateId: suggestTemplateFromBusinessType(result.businessType) as ContractTemplateId,
    content: {
      ...empty,
      basicInfo: {
        ...empty.basicInfo,
        address: result.address,
        phone: result.phone,
        businessHours: result.businessHours,
        closedDays: result.closedDays,
        instagramUrl: result.instagramUrl,
        reservationUrl: result.officialUrl,
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
