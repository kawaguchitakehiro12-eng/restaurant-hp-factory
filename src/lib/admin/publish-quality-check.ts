import type { DemoSite } from "@/types/demo";
import { ensureDemoContent } from "@/types/demo-content";
import { resolveDemoStore } from "@/lib/stores/demo-content-resolver";

export type PublishCheckItemId =
  | "photos"
  | "businessHours"
  | "map"
  | "sns"
  | "menu"
  | "logo";

export type PublishCheckItem = {
  id: PublishCheckItemId;
  /** チェック項目名（完了時） */
  label: string;
  /** 未完了時に表示する短いラベル */
  missingLabel: string;
  done: boolean;
  hint?: string;
};

export type PublishQualityReport = {
  score: number;
  items: PublishCheckItem[];
  missingLabels: string[];
  isReady: boolean;
};

export const PUBLISH_QUALITY_WARN_THRESHOLD = 70;
export const PUBLISH_QUALITY_CONFIRM_THRESHOLD = 50;

function isFilled(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

function isGoogleMapUrl(value: string): boolean {
  const v = value.trim().toLowerCase();
  return (
    v.includes("google.com/maps") ||
    v.includes("maps.google") ||
    v.includes("goo.gl/maps") ||
    v.includes("maps.app.goo.gl")
  );
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function hasUserPhoto(site: DemoSite): boolean {
  const content = ensureDemoContent(site.content);
  const { sampleFlags } = resolveDemoStore(site);

  const heroOk = isFilled(content.photos.hero) && !sampleFlags.photos.hero;
  const secondaryOk =
    (isFilled(content.photos.interior) && !sampleFlags.photos.interior) ||
    (isFilled(content.photos.food) && !sampleFlags.photos.food) ||
    (isFilled(content.photos.exterior) && !sampleFlags.photos.exterior) ||
    content.photos.gallery.some((g) => isFilled(g.url));

  return heroOk && secondaryOk;
}

function hasBusinessHours(site: DemoSite): boolean {
  const bi = ensureDemoContent(site.content).basicInfo;
  return (
    isFilled(bi.businessHours) ||
    isFilled(bi.weekdayHours) ||
    isFilled(bi.weekendHours)
  );
}

function hasGoogleMap(site: DemoSite): boolean {
  const mapUrl = ensureDemoContent(site.content).basicInfo.mapEmbedUrl;
  return isFilled(mapUrl) && isGoogleMapUrl(mapUrl);
}

function hasSns(site: DemoSite): boolean {
  const url = ensureDemoContent(site.content).basicInfo.instagramUrl;
  return isFilled(url) && isValidHttpUrl(url);
}

function hasMenu(site: DemoSite): boolean {
  const content = ensureDemoContent(site.content);
  return content.menus.some((m) => m.visible && isFilled(m.name));
}

function hasLogoBranding(site: DemoSite): boolean {
  const content = ensureDemoContent(site.content);
  const { sampleFlags } = resolveDemoStore(site);
  const storeNameOk = isFilled(site.storeName) && site.storeName.trim().length >= 2;
  const catchCopyOk = isFilled(content.basicInfo.catchCopy) && !sampleFlags.basicInfo.catchCopy;
  const nameEnOk = isFilled(content.basicInfo.nameEn) && !sampleFlags.basicInfo.nameEn;
  return storeNameOk && (catchCopyOk || nameEnOk);
}

/** 公開前品質チェック（DemoSite の content 構造をそのまま利用） */
export function evaluatePublishQuality(site: DemoSite): PublishQualityReport {
  const items: PublishCheckItem[] = [
    {
      id: "photos",
      label: "写真",
      missingLabel: "写真不足",
      done: hasUserPhoto(site),
      hint: "ヒーロー写真と、店内・料理・外観・ギャラリーのいずれか",
    },
    {
      id: "businessHours",
      label: "営業時間",
      missingLabel: "営業時間未入力",
      done: hasBusinessHours(site),
      hint: "営業時間または平日・土日の時間帯",
    },
    {
      id: "map",
      label: "Google Map",
      missingLabel: "Google Map未設定",
      done: hasGoogleMap(site),
      hint: "Google Maps の埋め込みURL",
    },
    {
      id: "sns",
      label: "SNS",
      missingLabel: "SNS未設定",
      done: hasSns(site),
      hint: "Instagram URL",
    },
    {
      id: "menu",
      label: "メニュー",
      missingLabel: "メニュー未登録",
      done: hasMenu(site),
      hint: "表示中のメニューが1件以上",
    },
    {
      id: "logo",
      label: "ロゴ",
      missingLabel: "ロゴ・ブランド表記未設定",
      done: hasLogoBranding(site),
      hint: "店舗名とキャッチコピーまたは英字表記",
    },
  ];

  const doneCount = items.filter((i) => i.done).length;
  const score = items.length === 0 ? 0 : Math.round((doneCount / items.length) * 100);
  const missingLabels = items.filter((i) => !i.done).map((i) => i.missingLabel);

  return {
    score,
    items,
    missingLabels,
    isReady: score >= PUBLISH_QUALITY_WARN_THRESHOLD,
  };
}

export function publishQualityLevel(
  score: number
): "good" | "warn" | "critical" {
  if (score >= PUBLISH_QUALITY_WARN_THRESHOLD) return "good";
  if (score >= PUBLISH_QUALITY_CONFIRM_THRESHOLD) return "warn";
  return "critical";
}

export const PUBLISH_CHECK_ITEM_DEFINITIONS: {
  id: PublishCheckItemId;
  label: string;
  missingLabel: string;
  description: string;
}[] = [
  {
    id: "photos",
    label: "写真",
    missingLabel: "写真不足",
    description: "ヒーロー写真＋店内・料理・外観・ギャラリーのいずれか1点以上",
  },
  {
    id: "businessHours",
    label: "営業時間",
    missingLabel: "営業時間未入力",
    description: "営業時間、または平日・土日の時間帯",
  },
  {
    id: "map",
    label: "Google Map",
    missingLabel: "Google Map未設定",
    description: "Google Maps の埋め込みURLまたは共有URL",
  },
  {
    id: "sns",
    label: "SNS",
    missingLabel: "SNS未設定",
    description: "Instagram などの SNS URL",
  },
  {
    id: "menu",
    label: "メニュー",
    missingLabel: "メニュー未登録",
    description: "サンプル以外のメニューが1件以上（表示ON）",
  },
  {
    id: "logo",
    label: "ロゴ",
    missingLabel: "ロゴ・ブランド表記未設定",
    description: "店舗名＋キャッチコピーまたは英字表記",
  },
];
