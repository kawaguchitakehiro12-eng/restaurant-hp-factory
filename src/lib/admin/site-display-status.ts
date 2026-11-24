import type { DemoSite } from "@/types/demo";

/** 管理画面表示用（デモ / 公開済み など） */
export type SiteDisplayStatus = "demo" | "published" | "suspended" | "lost";

export const SITE_DISPLAY_STATUS_LABELS: Record<SiteDisplayStatus, string> = {
  demo: "デモ",
  published: "公開済み",
  suspended: "停止",
  lost: "失注",
};

export function getSiteDisplayStatus(site: DemoSite): SiteDisplayStatus {
  if (site.siteContractStatus === "lost") return "lost";
  if (
    site.siteContractStatus === "suspended" ||
    site.publishStatus === "suspended"
  ) {
    return "suspended";
  }
  if (
    site.siteContractStatus === "contracted" &&
    site.publishStatus === "published"
  ) {
    return "published";
  }
  return "demo";
}

export function siteDisplayStatusVariant(
  status: SiteDisplayStatus
): "gray" | "blue" | "yellow" | "green" | "red" | "orange" {
  switch (status) {
    case "demo":
      return "blue";
    case "published":
      return "green";
    case "suspended":
      return "gray";
    case "lost":
      return "red";
    default:
      return "gray";
  }
}

export function isDemoPhase(site: DemoSite): boolean {
  return getSiteDisplayStatus(site) === "demo";
}

export function isPublishedSite(site: DemoSite): boolean {
  return getSiteDisplayStatus(site) === "published";
}
