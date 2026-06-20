import type { BusinessType, ContractTemplateId, DemoSiteFormInput } from "@/types/demo";
import type { DemoSiteContent } from "@/types/demo-content";
import { createEmptyDemoContent } from "@/types/demo-content";
import type {
  AiClassifiedPhoto,
  AiDemoDraft,
  AiDemoDraftInput,
  AiMenuDraft,
  AiPhotoClassification,
} from "@/types/ai-demo-draft";
import { generateId, normalizeSlug } from "@/lib/admin/form-utils";

const MOCK_DELAY_MS = 1800;

const IMG = {
  hero: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=2400&q=90&auto=format&fit=crop",
  interior: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1600&q=92&auto=format&fit=crop",
  food: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=1200&q=92&auto=format&fit=crop",
  exterior: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=90&auto=format&fit=crop",
  gallery1: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=1200&q=92&auto=format&fit=crop",
  gallery2: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=92&auto=format&fit=crop",
  menu1: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=90&auto=format&fit=crop",
  menu2: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&q=90&auto=format&fit=crop",
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTabelogUrl(url: string): boolean {
  return /tabelog\.com/i.test(url);
}

function isInstagramUrl(url: string): boolean {
  return /instagram\.com/i.test(url);
}

/** 食べログURLから店舗名らしき文字列を抽出（モック用ヒューリスティック） */
function guessStoreNameFromTabelog(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    const segments = parsed.pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1];
    if (!last || last.length < 2) return null;
    const decoded = decodeURIComponent(last);
    if (/^\d/.test(decoded)) return null;
    return decoded.replace(/[-_]/g, " ").trim() || null;
  } catch {
    return null;
  }
}

function classifyPhotos(
  items: {
    url: string;
    alt: string;
    classification: AiPhotoClassification;
    source: AiClassifiedPhoto["source"];
  }[]
): AiClassifiedPhoto[] {
  return items.map((item) => ({
    url: item.url,
    alt: item.alt,
    classification: item.classification,
    source: item.source,
  }));
}

function buildPhotosFromClassification(classified: AiClassifiedPhoto[]): AiDemoDraft["photos"] {
  const photos = {
    hero: "",
    interior: "",
    food: "",
    exterior: "",
    gallery: [] as { url: string; alt: string }[],
  };

  for (const photo of classified) {
    switch (photo.classification) {
      case "hero":
        if (!photos.hero) photos.hero = photo.url;
        else photos.gallery.push({ url: photo.url, alt: photo.alt });
        break;
      case "interior":
        if (!photos.interior) photos.interior = photo.url;
        else photos.gallery.push({ url: photo.url, alt: photo.alt });
        break;
      case "food":
        if (!photos.food) photos.food = photo.url;
        else photos.gallery.push({ url: photo.url, alt: photo.alt });
        break;
      case "exterior":
        if (!photos.exterior) photos.exterior = photo.url;
        else photos.gallery.push({ url: photo.url, alt: photo.alt });
        break;
      case "gallery":
        photos.gallery.push({ url: photo.url, alt: photo.alt });
        break;
    }
  }

  return photos;
}

/** モック: 食べログ中心の取得シナリオ */
function buildTabelogMock(input: AiDemoDraftInput): AiDemoDraft {
  const storeName = guessStoreNameFromTabelog(input.tabelogUrl) ?? "炉端 海音";
  const extractedFields: string[] = [
    "storeName",
    "businessType",
    "address",
    "phone",
    "businessHours",
  ];

  const classified = classifyPhotos([
    {
      url: IMG.hero,
      alt: `${storeName} ファーストビュー`,
      classification: "hero",
      source: "tabelog",
    },
    {
      url: IMG.interior,
      alt: `${storeName} 店内`,
      classification: "interior",
      source: "tabelog",
    },
    {
      url: IMG.food,
      alt: `${storeName} 料理`,
      classification: "food",
      source: "tabelog",
    },
    {
      url: IMG.exterior,
      alt: `${storeName} 外観`,
      classification: "exterior",
      source: "tabelog",
    },
    {
      url: IMG.gallery1,
      alt: `${storeName} ギャラリー`,
      classification: "gallery",
      source: "tabelog",
    },
    {
      url: IMG.gallery2,
      alt: `${storeName} 雰囲気`,
      classification: "gallery",
      source: "instagram",
    },
  ]);
  extractedFields.push("photos");

  const menus: AiMenuDraft[] = [
    {
      name: "本日のおすすめ刺身盛り合わせ",
      price: "¥2,480",
      description: "築地直送の鮮魚を中心に、季節のネタを盛り合わせ。",
      imageUrl: IMG.menu1,
    },
    {
      name: "炭火焼き地鶏もも",
      price: "",
      description: "備長炭でじっくり焼き上げた香ばしい一品。",
      imageUrl: IMG.menu2,
    },
    {
      name: "季節の小鉢",
      price: "¥680",
      description: "",
      imageUrl: "",
    },
  ];
  extractedFields.push("menus");

  const generatedCopyFields = ["catchCopy", "subCopy", "concept"];

  return {
    storeName,
    businessType: "izakaya",
    address: "東京都港区六本木4-12-1 六本木ビル2F",
    phone: "03-1234-5678",
    businessHours: "17:00 – 23:30（L.O. 23:00）",
    closedDays: "",
    mapEmbedUrl: "",
    instagramUrl: input.instagramUrl.trim(),
    officialUrl: input.officialUrl?.trim() ?? "",

    catchCopy: `${storeName}で味わう、旬の炭火と地酒`,
    subCopy: "",
    subCopyLines: ["厳選食材を炭火で。", "落ち着いた空間で", "特別なひとときを。"],
    concept: `${storeName}は、旬の食材を炭火で仕上げる居酒屋です。仕入れの情報をもとに、店舗の雰囲気に合わせたコピーを生成しています。`,

    menus,
    classifiedPhotos: classified,
    photos: buildPhotosFromClassification(classified),
    extractedFields,
    generatedCopyFields,
    sourceUrls: input,
  };
}

/** モック: Instagram中心（取得情報が少ないシナリオ） */
function buildInstagramOnlyMock(input: AiDemoDraftInput): AiDemoDraft {
  const extractedFields: string[] = ["instagramUrl", "photos"];

  const classified = classifyPhotos([
    {
      url: IMG.hero,
      alt: "Instagram投稿",
      classification: "hero",
      source: "instagram",
    },
    {
      url: IMG.food,
      alt: "Instagram投稿 料理",
      classification: "food",
      source: "instagram",
    },
    {
      url: IMG.gallery1,
      alt: "Instagram投稿",
      classification: "gallery",
      source: "instagram",
    },
  ]);

  const generatedCopyFields = ["catchCopy", "concept"];

  return {
    storeName: "",
    businessType: "cafe",
    address: "",
    phone: "",
    businessHours: "",
    closedDays: "",
    mapEmbedUrl: "",
    instagramUrl: input.instagramUrl.trim(),
    officialUrl: input.officialUrl?.trim() ?? "",

    catchCopy: "SNSで見つけた、あのお店の雰囲気をそのままに",
    subCopy: "",
    subCopyLines: [],
    concept:
      "Instagramの投稿内容をもとに、店舗の雰囲気に合った紹介文を生成しています。住所・電話番号などは取得できなかったため空欄です。",

    menus: [],
    classifiedPhotos: classified,
    photos: buildPhotosFromClassification(classified),
    extractedFields,
    generatedCopyFields,
    sourceUrls: input,
  };
}

/**
 * URLからデモ下書きを生成（現在はモック実装）
 * 将来: ここを本物のAI API呼び出しに差し替え
 */
export async function generateDemoDraftFromUrls(
  input: AiDemoDraftInput
): Promise<AiDemoDraft> {
  await sleep(MOCK_DELAY_MS);

  const tabelog = input.tabelogUrl.trim();

  if (isTabelogUrl(tabelog)) {
    return buildTabelogMock(input);
  }

  if (isInstagramUrl(input.instagramUrl.trim())) {
    return buildInstagramOnlyMock(input);
  }

  return buildTabelogMock(input);
}

export function suggestTemplateFromBusinessType(
  businessType: BusinessType
): ContractTemplateId {
  switch (businessType) {
    case "cafe":
      return "cafe";
    case "bar":
      return "bar";
    case "italian":
      return "bal";
    case "izakaya":
      return "izakaya-casual";
    case "japanese":
      return "luxury-japanese";
    default:
      return "luxury-japanese";
  }
}

export function aiDraftToDemoContent(draft: AiDemoDraft): DemoSiteContent {
  const empty = createEmptyDemoContent();

  return {
    basicInfo: {
      ...empty.basicInfo,
      catchCopy: draft.catchCopy,
      subCopy: draft.subCopy,
      subCopyLines: draft.subCopyLines,
      concept: draft.concept,
      address: draft.address,
      phone: draft.phone,
      businessHours: draft.businessHours,
      closedDays: draft.closedDays,
      mapEmbedUrl: draft.mapEmbedUrl,
      instagramUrl: draft.instagramUrl,
      reservationUrl: draft.officialUrl,
    },
    photos: {
      hero: draft.photos.hero,
      interior: draft.photos.interior,
      food: draft.photos.food,
      exterior: draft.photos.exterior,
      gallery: draft.photos.gallery.map((g, i) => ({
        id: generateId("gallery"),
        url: g.url,
        alt: g.alt,
        caption: "",
        sortOrder: i + 1,
      })),
    },
    menus: draft.menus.map((m, i) => ({
      id: generateId("menu"),
      name: m.name,
      price: m.price,
      description: m.description,
      imageUrl: m.imageUrl,
      visible: true,
      sortOrder: i + 1,
    })),
    topics: [],
  };
}

/** AI下書きをデモ作成フォームへ反映 */
export function applyAiDraftToForm(
  draft: AiDemoDraft,
  current: DemoSiteFormInput
): DemoSiteFormInput {
  const storeName = draft.storeName || current.storeName;
  const sourceUrl =
    draft.officialUrl ||
    draft.sourceUrls.tabelogUrl ||
    draft.sourceUrls.instagramUrl ||
    current.sourceUrl;

  return {
    ...current,
    storeName,
    storeSlug: storeName ? normalizeSlug(storeName) : current.storeSlug,
    businessType: draft.businessType || current.businessType,
    sourceUrl,
    address: draft.address || current.address,
    phone: draft.phone || current.phone,
    templateId: suggestTemplateFromBusinessType(draft.businessType),
    content: aiDraftToDemoContent(draft),
  };
}

export function validateAiDraftInput(input: AiDemoDraftInput): string | null {
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

/** 確認画面用: 空欄表示 */
export function displayOrEmpty(value: string | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "（未取得 — 公開時はサンプル表示）";
}
