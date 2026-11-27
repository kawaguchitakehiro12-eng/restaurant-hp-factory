import type { DemoSite } from "@/types/demo";
type State = Pick<DemoSite, "siteContractStatus" | "publishStatus">;
export function isPublicSiteVisible(site: State): boolean {
  return site.siteContractStatus === "contracted" && site.publishStatus === "published";
}
export function isSharedSiteVisible(site: State): boolean {
  return ["demo", "contracted"].includes(site.siteContractStatus) &&
    ["draft", "published"].includes(site.publishStatus);
}
